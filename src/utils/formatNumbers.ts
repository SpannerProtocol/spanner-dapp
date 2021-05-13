import BN from 'bn.js'

/**
 * Return the value provided after handling the precisions safely
 * @param num the value to adjust for precision
 * @param precision number of decimal places
 * @returns string of the number after precision adjustments
 */
export function formatPrecision(num: number | string, precision: number) {
  let numStr = num.toString()
  const split = numStr.split('.')
  const integer = split[0]
  let decimals = split[1]
  if (decimals) {
    decimals = decimals.slice(0, precision)
  }
  numStr = decimals ? `${integer}.${decimals}` : integer
  return numStr
}

const si = [
  { value: 1, symbol: '' },
  { value: 1e3, symbol: 'K' },
  { value: 1e6, symbol: 'M' },
  { value: 1e9, symbol: 'B' },
  { value: 1e12, symbol: 'T' },
  { value: 1e15, symbol: 'K T' },
  { value: 1e18, symbol: 'M T' },
]

const rx = /\.0+$|(\.[0-9]*[1-9])0+$/

export function toHumanNumber(num: number, digits: number): string {
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
}

/**
 * Format a number with thousands abbreviation e.g. 2.53K
 * @param num BN
 * @param precision decimal places
 * @returns number as string
 */
export function bnToHumanNumber(num: BN, precision = 0) {
  let i = 0
  for (i = si.length - 1; i > 0; i--) {
    if (num.gte(new BN(si[i].value.toString()))) {
      break
    }
  }
  const siValue = new BN(si[i].value)
  const integer = num.div(siValue).toString()
  const decimals = num.toString().slice(integer.length, num.toString().length)
  return formatPrecision(integer + '.' + decimals, precision) + si[i].symbol
}

export function noNan(num: number) {
  return Number.isNaN(num) ? 0 : num
}

export function abs(num: number) {
  return Math.abs(num)
}
