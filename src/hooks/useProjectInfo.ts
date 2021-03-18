import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { Balance } from '@polkadot/types/interfaces'

interface ProjectInfo {
  project: string
  token: string
  totalIssuance: Balance
}

// Need to enhance this with more project information
// once project registration is available
export default function useProjectInfos(): Array<ProjectInfo> | undefined {
  const { api, connected } = useApi()
  const [tokens, setTokens] = useState<Array<ProjectInfo>>()
  const [nativeCurrency, setNativeCurrency] = useState<ProjectInfo>()
  const [projects, setProjects] = useState<Array<ProjectInfo>>()

  useEffect(() => {
    if (!connected) return
    // For BOLT
    api.query.balances.totalIssuance((balance) => {
      setNativeCurrency({
        project: 'Spanner',
        token: 'BOLT',
        totalIssuance: balance,
      })
    })
    // For all other tokens
    api.query.tokens.totalIssuance.entries().then((result) => {
      const filtered = result.filter((token) => token[0].args[0].isToken)
      const tokenList = filtered.map(([storageKey, balance]) => ({
        project: storageKey.args[0].asToken.toString(),
        token: storageKey.args[0].asToken.toString(),
        totalIssuance: balance,
      }))
      setTokens(tokenList)
    })
  }, [api, connected])

  useEffect(() => {
    if (!nativeCurrency || !tokens) return
    setProjects([nativeCurrency, ...tokens])
  }, [nativeCurrency, tokens])

  return projects
}
