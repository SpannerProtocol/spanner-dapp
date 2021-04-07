import { TravelCabinBuyerInfo, TravelCabinInfo } from 'spanner-interfaces'
import BN from 'bn.js'
import { BlockNumber } from '@polkadot/types/interfaces'
import { bnToUnit } from './formatUnit'

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