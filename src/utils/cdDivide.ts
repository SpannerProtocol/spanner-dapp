import BN from 'bn.js'

export default function cdDivide(dividend: BN, divisor: BN, chainDecimals: number) {
  // Precision for bn division
  const cd = new BN(10).pow(new BN(chainDecimals))
  const dividendNum = dividend.div(cd)
  const divisorNum = divisor.div(cd)
  const result = dividendNum.toNumber() / divisorNum.toNumber()
  return result
}
