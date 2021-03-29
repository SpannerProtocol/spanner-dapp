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
    balanceStr = parseFloat(balanceStr.replaceAll(',', '')).toLocaleString(undefined, {
      maximumFractionDigits: precision,
    })
  }
  if (unformatted) {
    balanceStr = balanceStr.toString().replaceAll(',', '').split('.')[0]
  }
  return balanceStr
}

/**
 * Given a number string, trim all leading and trailing zeros.
 * Will prefix 0 if original value started with a decimal
 * @param num number as a string
 */
export function formatZeros(num: string) {
  if (num.includes('.')) {
    let indexOfFirstNum = 0
    const numSplit = num.split('.')
    const reversedDecimals = numSplit[1].split('').reverse()
    if (reversedDecimals.every((e) => e === '0')) {
      indexOfFirstNum = reversedDecimals.length
    } else {
      for (let i = 0; i < reversedDecimals.length; i++) {
        if (reversedDecimals[i] !== '0') {
          indexOfFirstNum = i
          break
        }
      }
    }
    const decimals = reversedDecimals.slice(indexOfFirstNum, reversedDecimals.length).reverse().join('')
    if (decimals.length > 0) {
      return numSplit[0] + '.' + decimals
    } else {
      return numSplit[0]
    }
  }
  return num
}

/**
 * Format a BN to Substrate Unit taking into account any decimal precision offsets used for BN
 * @param num BN instance to be formatted
 * @param chainDecimals decimals in chain
 * @param precisionOffset decimals places to shift left or right
 * @param cleanZeros clean up any trailing zeros and if number is decimal less than 1 prefix with a 0
 */
export function bnToUnit(num: BN, chainDecimals: number, precisionOffset = 0, cleanZeros = false) {
  const numStr = num.toString()
  const toShift = numStr.length - (chainDecimals - precisionOffset)
  const zerosAfterDecimal = toShift < 0 ? toShift * -1 : 0
  const left = numStr.substring(0, toShift) + '.' + '0'.repeat(zerosAfterDecimal)
  const right = numStr.substring(toShift)
  if (cleanZeros) {
    return formatZeros(left + right)
  } else {
    return left + right
  }
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
