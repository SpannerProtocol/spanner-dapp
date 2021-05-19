import { DpoInfo, TravelCabinBuyerInfo, TravelCabinInfo } from 'spanner-interfaces'
import BN from 'bn.js'
import { BlockNumber, Moment } from '@polkadot/types/interfaces'
import { bnToUnit } from './formatUnit'
import { daysToBlocks } from './formatBlocks'

export function getCabinYield(
  cabinInfo: TravelCabinInfo,
  buyerInfo: TravelCabinBuyerInfo,
  lastBlock: BlockNumber,
  chainDecimals: number
) {
  // Precision for bn division
  const bn10000 = new BN(10000)
  let percentage = new BN(10000)
  if (!cabinInfo.maturity.isZero()) {
    const blockSincePurchase = lastBlock.sub(buyerInfo.purchase_blk)
    percentage = blockSincePurchase.mul(bn10000).div(cabinInfo.maturity.toBn())
    percentage = percentage.gte(bn10000) ? bn10000 : percentage
    const accumulatedYield = percentage.mul(cabinInfo.yield_total.toBn())
    const amount = accumulatedYield.sub(buyerInfo.yield_withdrawn.toBn().mul(bn10000))
    if (amount.gt(new BN(0))) {
      // shift decimal places by 4 because of precision used with
      const amountInPrecision = bnToUnit(amount, chainDecimals, -4, true)
      return amountInPrecision
    } else {
      return '0'
    }
  }
}

/**
 * Treasure Hunting Rule - returns time left for treasure hunting grace period
 * @param buyerInfo TravelCabinBuyerInfo
 * @param lastBlock the last block
 * @param expectedBlockTime chain block time in milliseconds
 * @returns string
 */
export function getTreasureHuntingGpLeft(
  buyerInfo: TravelCabinBuyerInfo,
  lastBlock: BlockNumber,
  expectedBlockTime: Moment
) {
  const gracePeriodTimeLeft = buyerInfo.blk_of_last_withdraw.add(daysToBlocks(7, expectedBlockTime))
  return gracePeriodTimeLeft.sub(lastBlock).isNeg() ? '0' : gracePeriodTimeLeft.sub(lastBlock).toString()
}

/**
 * Lazy Manager Rule - returns time left for lazy manager grace period.
 * @param dpoInfo DpoInfo
 * @param lastBlock the last block
 * @param expectedBlockTime chain block time in milliseconds
 * @returns string or undefined. undefined is useful if there is no block time.
 */
export function getLazyManagerGpLeft(dpoInfo: DpoInfo, lastBlock: BlockNumber, expectedBlockTime: Moment) {
  if (dpoInfo.blk_of_last_yield.isSome) {
    const gracePeriodTimeLeft = dpoInfo.blk_of_last_yield.unwrapOrDefault().add(daysToBlocks(7, expectedBlockTime))
    return gracePeriodTimeLeft.sub(lastBlock).isNeg() ? '0' : gracePeriodTimeLeft.sub(lastBlock).toString()
  } else if (dpoInfo.blk_of_last_yield.isNone) {
    return undefined
  }
  return '0'
}

/**
 * Life Sentence Rule - returns time left for life sentence grace period.
 * @param dpoInfo DpoInfo
 * @param lastBlock the last block
 * @param expectedBlockTime chain block time in milliseconds
 * @returns string or undefined. undefined is useful if there is no block time.
 */
export function getLifeSentenceGpLeft(dpoInfo: DpoInfo, lastBlock: BlockNumber, expectedBlockTime: Moment) {
  if (dpoInfo.blk_of_dpo_filled.isSome) {
    const gracePeriodTimeLeft = dpoInfo.blk_of_dpo_filled.unwrapOrDefault().add(daysToBlocks(7, expectedBlockTime))
    return gracePeriodTimeLeft.sub(lastBlock).isNeg() ? '0' : gracePeriodTimeLeft.sub(lastBlock).toString()
  } else if (dpoInfo.blk_of_dpo_filled.isNone) {
    return undefined
  }
  return '0'
}
