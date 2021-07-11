import BN from 'bn.js'
import type { Moment } from '@polkadot/types/interfaces'
import { blockToDays } from './formatBlocks'
import { u32 } from '@polkadot/types'
import { Decimal } from 'decimal.js'
interface GetApyParams {
  totalYield: BN
  totalDeposit: BN
  blockTime: Moment
  chainDecimals: number
  maturity?: u32 | string
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
  maturity,
  precision,
}: GetApyParams) {
  const cd = new Decimal(chainDecimals)
  const yieldDec = new Decimal(totalYield.toString())
  const depositDec = new Decimal(totalDeposit.toString())
  const yieldInUnit = yieldDec.div(new Decimal(10).pow(cd))
  const depositInUnit = depositDec.div(new Decimal(10).pow(cd))
  // period is the maturity
  if (maturity) {
    const periodInDays = parseFloat(blockToDays(maturity, blockTime, 8))
    return yieldInUnit
      .div(depositInUnit)
      .mul(new Decimal(360 / periodInDays))
      .mul(100)
      .toFixed(precision ? precision : 0)
  } else {
    return yieldInUnit
      .div(depositInUnit)
      .mul(360)
      .toFixed(precision ? precision : 0)
  }
}
