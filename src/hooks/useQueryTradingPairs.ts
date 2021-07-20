import { useEffect, useState } from 'react'
import { TradingPair } from 'spanner-api/types'
import { useApi } from './useApi'

interface ValidPair {
  isValid: boolean
  validPair: any
  enabledPair: TradingPair | undefined
  reversed: boolean
}

export function getEnabledPair(enabledPairs: Array<TradingPair>, inputPair: any): ValidPair {
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

export function useEnabledPair(inputA: string, inputB: string) {
  const enabledPairs = useEnabledTradingPairs()
  const validQuery = getEnabledPair(enabledPairs, [{ Token: inputA }, { Token: inputB }])
  return validQuery
}
