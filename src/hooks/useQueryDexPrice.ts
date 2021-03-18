import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { getPriceByPair, getEnabledPair } from '../utils/getDexPrices'
import { Balance } from '@polkadot/types/interfaces'
import { ITuple } from '@polkadot/types/types'
import { useEnabledTradingPairs } from './useQueryTradingPairs'

interface PoolResponse {
  error?: string
  price?: number
  dexShare?: [Balance, Balance]
  input?: any
}

export default function useSubscribePool(inputTradingPair: any, delay?: number): PoolResponse {
  const { api, connected } = useApi()
  const [price, setPrice] = useState<number>()
  const [dexShare, setDexShare] = useState<[Balance, Balance]>()
  const [priceQueryError, setPriceQueryError] = useState<string>()

  const enabledTradingPairs = useEnabledTradingPairs()

  useEffect(() => {
    if (!connected) return
    const validQuery = getEnabledPair(enabledTradingPairs, inputTradingPair)
    if (!validQuery.isValid) {
      setPrice(undefined)
      setPriceQueryError('This pair is not available.')
      return
    }

    api.query.dex.liquidityPool(validQuery.validPair, (lpTradingPair: ITuple<[Balance, Balance]>) => {
      const lp = lpTradingPair.map((currencyId) => parseFloat(currencyId.toString()))
      if (lp[1] === 0 && lp[0] === 0) {
        setPriceQueryError(`No liquidity for pair`)
        return
      }
      const priceByPair = getPriceByPair(validQuery.enabledPair, inputTradingPair, lpTradingPair)
      setPriceQueryError(undefined)
      setTimeout(
        () => {
          setPrice(priceByPair)
          setDexShare(lpTradingPair)
        },
        delay ? delay : 8000
      )
    })
  }, [api, connected, inputTradingPair, enabledTradingPairs, delay])

  return { price, dexShare, input: inputTradingPair, error: priceQueryError }
}
