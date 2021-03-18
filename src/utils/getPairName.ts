import { TradingPair } from 'interfaces/dex'

export function getPairName(pair: TradingPair): string {
  return pair[0].asToken.toString() + '/' + pair[1].asToken.toString()
}
