import { u32 } from '@polkadot/types'
import BN from 'bn.js'

export function getTargetAmount(supplyPool: BN, targetPool: BN, supplyAmount: BN, fee: [u32, u32]): BN {
  const [feeNum, feeDenom] = fee
  const supplyAmountWithFee: BN = supplyAmount.mul(feeDenom.sub(feeNum))
  const numerator = supplyAmountWithFee.mul(targetPool)
  const denominator = supplyPool.mul(feeDenom).add(supplyAmountWithFee)
  const target = numerator.div(denominator)
  return target.isNeg() ? targetPool : target
}

export function getSupplyAmount(supplyPool: BN, targetPool: BN, targetAmount: BN, fee: [u32, u32]): BN {
  const [feeNum, feeDenom] = fee
  const numerator = supplyPool.mul(targetAmount).mul(feeDenom)
  const denominator = targetPool.sub(targetAmount).mul(feeDenom.sub(feeNum))
  const supply = numerator.div(denominator).add(new BN(1))
  return supply.isNeg() ? supplyPool : supply
}
