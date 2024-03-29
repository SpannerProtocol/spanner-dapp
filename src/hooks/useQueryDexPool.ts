import { u32 } from '@polkadot/types'
import { Balance } from 'spanner-api/types'
import { TradingPair } from 'spanner-api/types'
import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { useQueryDexFee } from './useQueryDexFee'
import { getEnabledPair, useEnabledTradingPairs } from './useQueryTradingPairs'
import { useSubstrate } from './useSubstrate'
import BN from 'bn.js'
interface PoolResponse {
  error?: string
  price?: number
  pool?: [Balance, Balance]
  dexFee?: [u32, u32]
  input?: any
}

export default function useSubscribePool(inputA: string, inputB: string, delay?: number): PoolResponse {
  const { api, connected } = useApi()
  const [pool, setPool] = useState<[Balance, Balance]>()
  const [price, setPrice] = useState<number>()
  const [poolQueryError, setPoolQueryError] = useState<string>()

  const enabledTradingPairs = useEnabledTradingPairs()
  const dexFee = useQueryDexFee()
  const { chainDecimals } = useSubstrate()

  useEffect(() => {
    if (!connected || enabledTradingPairs.length === 0) return
    const validQuery = getEnabledPair(enabledTradingPairs, [{ Token: inputA }, { Token: inputB }])
    if (!validQuery.isValid) {
      setPool(undefined)
      setPoolQueryError('This pair is not available.')
      return
    }
    api.query.dex.liquidityPool(validQuery.validPair, (lpTradingPair: [Balance, Balance]) => {
      if (lpTradingPair[1].isZero() || lpTradingPair[0].isZero()) {
        setPool(undefined)
        setPoolQueryError(`No liquidity for pair`)
        return
      }
      setTimeout(
        () => {
          const cd = new BN(chainDecimals)
          if (validQuery.reversed) {
            setPool([lpTradingPair[1], lpTradingPair[0]])
            setPrice(lpTradingPair[0].div(cd).toNumber() / lpTradingPair[1].div(cd).toNumber())
          } else {
            setPool(lpTradingPair)
            setPrice(lpTradingPair[1].div(cd).toNumber() / lpTradingPair[0].div(cd).toNumber())
          }
          setPoolQueryError(undefined)
        },
        delay ? delay : 2000
      )
    })
  }, [api, connected, inputA, inputB, enabledTradingPairs, delay, chainDecimals])

  return { pool, price, dexFee, error: poolQueryError }
}

export function usePoolsWithToken(token: string) {
  const { api, connected } = useApi()
  const [pools, setPools] = useState<[[TradingPair], [Balance, Balance]][]>([])

  useEffect(() => {
    if (!connected) return
    api.query.dex.liquidityPool.entries().then((entries) => {
      entries.forEach(([storageKey, balances]) => {
        if (storageKey.args[0].isEmpty) return
        if (!storageKey.args[0][0].isToken) return
        if (
          storageKey.args[0][0].asToken.eq(token.toUpperCase()) ||
          storageKey.args[0][1].asToken.eq(token.toUpperCase())
        ) {
          setPools((prev) => [...prev, [storageKey.args, balances]])
        }
      })
    })
  }, [api, connected, token])

  return pools
}
