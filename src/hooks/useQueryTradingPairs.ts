import { useEffect, useState } from 'react'
import { TradingPair } from 'spanner-interfaces'
import { useApi } from './useApi'

export function useEnabledTradingPairs(): Array<TradingPair> {
  const { api, connected } = useApi()
  const [enabledTradingPairs, setEnabledTradingPairs] = useState<Array<TradingPair>>([])

  useEffect(() => {
    if (!connected) return
    api.query.dex.tradingPairStatuses.entries().then((result) => {
      const enabledPairs = result.filter((pair) => pair[1].isEnabled)
      const unwrappedPairs = enabledPairs.map((pair) => pair[0].args[0])
      setEnabledTradingPairs(unwrappedPairs)
    })
  }, [api, connected])

  return enabledTradingPairs
}
