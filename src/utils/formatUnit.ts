import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { toHumanNumber } from './formatLargeNumbers'

export function formatToUnit(
  balance: number | BN | BigNumber | string,
  decimals: number,
  precision?: number,
  unformatted?: boolean
): string {
  let balanceStr = formatBalance(balance.toString(), { withSi: false, forceUnit: '-' }, decimals)
  if (precision) {
    balanceStr = parseFloat(balanceStr.replace(',', '')).toLocaleString(undefined, { maximumFractionDigits: precision })
  }
  if (unformatted) {
    balanceStr = balanceStr.toString().replace(',', '').split('.')[0]
  }
  return balanceStr
}

export function formatToHumanFromUnit(balance: number | BN | BigNumber | string, decimals: number) {
  const strippedBalance = formatToUnit(balance, decimals, 0, true)
  return toHumanNumber(parseInt(strippedBalance), 0)
}

export function unitToNumber(balance: number, decimals: number): number {
  return (balance as number) * 10 ** decimals
}

export function unitToBn(balance: number | BN | string, decimals: number): BN {
  if (typeof balance === 'number' || typeof balance === 'string') {
    return new BN(balance).mul(new BN(10 ** decimals))
  }
  return balance.mul(new BN(10 ** decimals))
}

export function unitToBigNumber(balance: number | BigNumber | string, decimals: number): BigNumber {
  if (typeof balance === 'number' || typeof balance === 'string') {
    return new BigNumber(balance).multipliedBy(new BigNumber(10 ** decimals))
  }
  return balance.multipliedBy(new BigNumber(10 ** decimals))
}
