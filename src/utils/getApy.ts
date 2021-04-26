import BN from 'bn.js'
import type { Moment } from '@polkadot/types/interfaces'
import { blockToDays } from './formatBlocks'
import { u32 } from '@polkadot/types'

interface GetApyParams {
  totalYield: BN
  totalDeposit: BN
  blockTime: Moment
  chainDecimals: number
  period?: u32
  precision?: number
}

/**
 * Our yield calculations are done with 360 days per year.
 */
export default function getApy({
  totalYield,
  totalDeposit,
  blockTime,
  chainDecimals,
  period,
  precision,
}: GetApyParams) {
  const cd = new BN(chainDecimals)
  const yieldNum = parseFloat(totalYield.div(new BN(10).pow(cd)).toString())
  const depositNum = parseFloat(totalDeposit.div(new BN(10).pow(cd)).toString())
  if (period) {
    const periodInDays = parseFloat(blockToDays(period, blockTime, 8))
    return ((yieldNum / depositNum) * (360 / periodInDays) * 100).toFixed(precision ? precision : 0)
  } else {
    return ((yieldNum / depositNum) * 360).toFixed(precision ? precision : 0)
  }
}
