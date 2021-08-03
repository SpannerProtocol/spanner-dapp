import { DpoInfo } from 'spanner-api/types'
import BN from 'bn.js'

export function getDpoRemainingPurchase(dpoInfo: DpoInfo): BN {
  return dpoInfo.target_amount.sub(dpoInfo.total_fund)
}

export function getDpoMinimumPurchase(dpoInfo: DpoInfo): BN {
  const onePercent = dpoInfo.target_amount.divn(100)
  const remaining = getDpoRemainingPurchase(dpoInfo)
  if (remaining.lte(onePercent)) {
    return remaining
  } else {
    return onePercent
  }
}

export function getDpoProgress(dpoInfo: DpoInfo): number {
  return (dpoInfo.total_fund.toNumber() / dpoInfo.target_amount.toNumber()) * 100
}
export function getDpoFees(dpoInfo: DpoInfo): { management: number; base: number } {
  const baseFee = dpoInfo.base_fee.toNumber() / 10
  const fee = dpoInfo.fee.toNumber() / 10
  const management = fee - baseFee
  return {
    management: management,
    base: baseFee,
  }
}