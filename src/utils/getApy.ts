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
    return ((yieldNum / depositNum) * (365 / periodInDays) * 100).toFixed(precision ? precision : 0)
  } else {
    return ((yieldNum / depositNum) * 365).toFixed(precision ? precision : 0)
  }
}
