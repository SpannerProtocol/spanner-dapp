import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'
import { bnToHumanNumber, formatPrecision, toHumanNumber } from './formatNumbers'
import { Decimal } from 'decimal.js'

/**
 * Typeguard for BN
 * @param num number, BN or string
 * @returns boolean
 */
export function isBN(num: number | BN | string): num is BN {
  return BN.isBN(num)
}

/**
 * General function for format a number with thousands separators given chainDecimals.
 * @param num any number, BN or string
 * @param cd chainDecimals
 * @param precision decimal place precision
 * @param toHuman thousands abbreviation
 * @returns formatted number as string
 */
export function formatToUnit(num: number | BN | string, cd: number, precision = 0, toHuman = false): string {
  if (toHuman) {
    if (isBN(num)) {
      const inUnit = num.div(new BN(10).pow(new BN(cd)))
      return bnToHumanNumber(inUnit, precision)
    } else if (typeof num === 'string') {
      return toHumanNumber(parseFloat(num), precision)
    } else {
      return toHumanNumber(num, precision)
    }
  }
  if (num.toString().length <= cd) {
    const numDec = new Decimal(num.toString())
    const cdDec = new Decimal(10 ** cd)
    return numDec.div(cdDec).toNumber().toLocaleString()
  }
  const numStr = formatBalance(num.toString(), { withSi: false, withUnit: false, forceUnit: '-', decimals: cd })
  return formatPrecision(numStr, precision)
}

/**
 * Get a Bn with chainDecimals accounted for from a number
 * @param amount any number
 * @param chainDecimals chain decimals
 * @returns BN
 */
export function numberToBn(amount: number | string, cd = 0) {
  const [integer, decimal] = amount.toString().split('.')
  return new BN(parseFloat('0.' + decimal) * 10 ** cd).add(new BN(integer).mul(new BN(10).pow(new BN(cd))))
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

export function formatToHumanFromUnit(balance: number | BN | string, decimals: number) {
  const strippedBalance = formatToUnit(balance, decimals, 0, true)
  return toHumanNumber(parseInt(strippedBalance), 0)
}

export function unitToBn(num: number | BN | string, cd: number): BN {
  if (typeof num === 'number' || typeof num === 'string') {
    return new BN(num).mul(new BN(10).pow(new BN(cd)))
  }
  return num.mul(new BN(10).pow(new BN(cd)))
}

export function unitToBnWithDecimal(num: number, chainDecimals: number): BN {
  const cd = new BN(chainDecimals)
  const [integer, decimal] = num.toString().split('.')
  return new BN(parseFloat('0.' + decimal) * 10 ** chainDecimals).add(new BN(integer).mul(new BN(10).pow(cd)))
}

export function bnToUnitNumber(num: BN, cd: number) {
  return parseFloat(bnToUnit(num, cd, 0))
}
