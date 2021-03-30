import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { default as projectJson } from '../spanner-projects.json'
import { ProjectJson } from '../utils/getProjectRegistry'

export interface TokenData {
  name: string
  iconPath: string
}
/**
 * Get a list of token names that have issuance on spanner
 */
export default function useTokens() {
  const { api, connected } = useApi()
  const [tokens, setTokens] = useState<TokenData[]>([
    {
      name: 'BOLT',
      iconPath: Object.keys(projectJson).includes('bolt') ? projectJson['bolt'].icon : 'placeholder-token.svg',
    },
  ])

  useEffect(() => {
    if (!connected) return
    api.query.tokens.totalIssuance.entries().then((entries) =>
      entries.forEach((entry) => {
        if (!entry[0].args[0].isToken) return
        const tokenName = entry[0].args[0].asToken.toString()
        const projectInfo = projectJson as ProjectJson
        setTokens((prev) => [
          ...prev,
          {
            name: tokenName,
            iconPath: Object.keys(projectJson).includes(tokenName.toLowerCase())
              ? projectInfo[tokenName.toLowerCase()].icon
              : 'placeholder-token.svg',
          },
        ])
      })
    )
  }, [api, connected])

  return tokens
}

/**
 * Get a list of enabled pairs for dex [tokenA, tokenB]
 */
export function useEnabledPairs() {
  const { api, connected } = useApi()
  const [pairs, setPairs] = useState<[string, string][]>([])

  useEffect(() => {
    if (!connected) return
    api.query.dex.tradingPairStatuses
      .entries()
      .then((entries) =>
        entries.forEach(
          (entry) =>
            entry[1].isEnabled &&
            setPairs((prev) => [...prev, [entry[0].args[0][0].toString(), entry[0].args[0][1].toString()]])
        )
      )
  }, [api, connected])
  return pairs
}
