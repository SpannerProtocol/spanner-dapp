import BN from 'bn.js'

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
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num.gte(new BN(si[i].value.toString()))) {
      break
    }
  }
  const siValue = new BN(si[i].value)
  const mod = num.mod(siValue).toString()
  const decimals = mod.toString().slice(0, precision)
  const decimalsInPrecision = decimals.length > 0 ? `.${decimals + '0'.repeat(precision - decimals.length)}` : ''
  return num.div(siValue).toString() + decimalsInPrecision + si[i].symbol
}
