import BN from 'bn.js'
import type { Moment } from '@polkadot/types/interfaces'
import { blockToDays } from './formatBlocks'
import { u32 } from '@polkadot/types'

interface GetApyParams {
  totalYield: BN
  totalDeposit: BN
  blocksInPeriod: Moment
  chainDecimals: number
  period?: u32
  days?: number
  precision?: number
}

export default function getApy({
  totalYield,
  totalDeposit,
  blocksInPeriod,
  chainDecimals,
  period,
  days,
  precision,
}: GetApyParams) {
  // BN doesn't handle decimals
  const decimalsBn = new BN(chainDecimals)
  const yieldNum = totalYield.div(decimalsBn).toNumber()
  const depositNum = totalDeposit.div(decimalsBn).toNumber()
  if (period) {
    const periodInDays = parseFloat(blockToDays(blocksInPeriod, period))
    return ((yieldNum / depositNum) * (365 / periodInDays) * 100).toFixed(precision ? precision : 2)
  } else if (days) {
    return ((yieldNum / depositNum / days) * 365).toFixed(precision ? precision : 2)
  } else {
    return ((yieldNum / depositNum) * 365).toFixed(precision ? precision : 2)
  }
}
