import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { Balance } from '@polkadot/types/interfaces'
import { useEnabledTradingPairs } from './useQueryTradingPairs'
import { useQueryDexFee } from './useQueryDexFee'
import { u32 } from '@polkadot/types'
import { TradingPair } from 'interfaces/dex'

interface PoolResponse {
  error?: string
  price?: number
  pool?: [Balance, Balance]
  dexFee?: [u32, u32]
  input?: any
}

interface ValidPair {
  isValid: boolean
  validPair: any
  enabledPair: TradingPair | undefined
  reversed: boolean
}

function getEnabledPair(enabledPairs: Array<TradingPair>, inputPair: any): ValidPair {
  let validPair = undefined
  for (const enabledPair of enabledPairs) {
    if (enabledPair.eq(inputPair)) {
      validPair = { isValid: true, validPair: inputPair, enabledPair, reversed: false }
      break
    } else {
      const reversed = [inputPair[1], inputPair[0]]
      if (enabledPair.eq(reversed)) {
        validPair = { isValid: true, validPair: reversed, enabledPair, reversed: true }
      }
    }
  }
  if (!validPair) return { isValid: false, validPair: undefined, enabledPair: undefined, reversed: false }
  return validPair
}

export default function useSubscribePool(inputTradingPair: any, delay?: number): PoolResponse {
  const { api, connected } = useApi()
  const [pool, setPool] = useState<[Balance, Balance]>()
  const [price, setPrice] = useState<number>()
  const [poolQueryError, setPoolQueryError] = useState<string>()

  const enabledTradingPairs = useEnabledTradingPairs()
  const dexFee = useQueryDexFee()

  useEffect(() => {
    if (!connected || enabledTradingPairs.length === 0) return
    const validQuery = getEnabledPair(enabledTradingPairs, inputTradingPair)
    if (!validQuery.isValid) {
      setPool(undefined)
      setPoolQueryError('This pair is not available.')
      return
    }

    api.query.dex.liquidityPool(validQuery.validPair, (lpTradingPair: [Balance, Balance]) => {
      const lp = lpTradingPair.map((currencyId) => parseFloat(currencyId.toString()))
      if (lp[1] === 0 && lp[0] === 0) {
        setPool(undefined)
        setPoolQueryError(`No liquidity for pair`)
        return
      }
      setTimeout(
        () => {
          setPool(lpTradingPair)
          if (validQuery.reversed) {
            setPrice(lpTradingPair[0].toNumber() / lpTradingPair[1].toNumber())
          } else {
            setPrice(lpTradingPair[1].toNumber() / lpTradingPair[0].toNumber())
          }
          setPoolQueryError(undefined)
        },
        delay ? delay : 8000
      )
    })
  }, [api, connected, inputTradingPair, enabledTradingPairs, delay])

  return { pool, price, dexFee, input: inputTradingPair, error: poolQueryError }
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
