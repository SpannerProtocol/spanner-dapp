import { FixedPointNumber } from './FixedPointNumber'
import { ApiPromise, ApiRx } from '@polkadot/api'
import { CurrencyId } from '../interfaces'

export declare type KNOWN_MODULES = 'honzon' | 'swap' | 'homa'
export declare type CHAIN = 'acala' | 'kurara' | 'polkadot' | 'kusama'

export interface TokenConfig {
  chain?: CHAIN
  name: string
  symbol?: string
  precision?: number
  amount?: number | string | FixedPointNumber
}
export declare type PresetToken = 'ACA' | 'AUSD' | 'DOT' | 'XBTC' | 'LDOT' | 'RENBTC' | 'KSM'
export declare const presetTokensConfig: Record<CHAIN, Record<PresetToken, TokenConfig>>
export declare const TokenAmount: typeof FixedPointNumber
export declare class Token {
  readonly chain: CHAIN
  readonly name: string
  readonly symbol: string
  readonly precision: number
  amount: FixedPointNumber
  constructor(config: TokenConfig)
  /**
   * @name isEqual
   * @description check if `token` equal current
   */
  isEqual(token: Token): boolean
  toString(): string
  toChainData():
    | {
        Token: string
      }
    | string
  clone(newConfig?: Partial<TokenConfig>): Token
}
export declare const PRESET_TOKENS: Record<CHAIN, Record<string, Token>>
export declare function getPresetToken(name: PresetToken, chain?: CHAIN): Token
export declare function sortTokens(token1: Token, token2: Token, ...other: Token[]): Token[]
export declare function token2CurrencyId(api: ApiPromise | ApiRx, token: Token): CurrencyId
export declare function currencyId2Token(token: CurrencyId): Token

export declare class TokenPair {
  private token1
  private token2
  private origin
  constructor(token1: Token, token2: Token)
  getOrigin(): [Token, Token]
  getPair(): [Token, Token]
  isEqual(pair: TokenPair): boolean
  toChainData(): [
    (
      | string
      | {
          Token: string
        }
    ),
    (
      | string
      | {
          Token: string
        }
    )
  ]
}
