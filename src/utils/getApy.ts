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
  // Should be safe to convert into float after slicing off the chainDecimals
  const yieldNum = parseFloat(totalYield.toString().slice(0, totalYield.toString.length - chainDecimals))
  const depositNum = parseFloat(totalDeposit.toString().slice(0, totalDeposit.toString.length - chainDecimals))
  if (period) {
    const periodInDays = parseFloat(blockToDays(period, blocksInPeriod, 8))
    return ((yieldNum / depositNum) * (365 / periodInDays) * 100).toFixed(precision ? precision : 0)
  } else if (days) {
    return ((yieldNum / depositNum / days) * 365).toFixed(precision ? precision : 0)
  } else {
    return ((yieldNum / depositNum) * 365).toFixed(precision ? precision : 0)
  }
}
