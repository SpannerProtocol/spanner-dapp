import { useApi } from 'hooks/useApi'
import { createContext, useEffect, useMemo, useState } from 'react'

const DEFAULT_STATE = {
  chain: '-',
  chainDecimals: 10,
  existentialDeposit: 1 / 1000,
}

export interface SubstrateState {
  chain?: string
  chainDecimals: number
  existentialDeposit: number
  genesis?: string
  genesisHash?: string
  chainTokens?: string
}

export const SubstrateContext = createContext<SubstrateState>({} as SubstrateState)

export function SubstrateProvider({ children }: any): JSX.Element {
  const { api, connected } = useApi()
  const [constants, setConstants] = useState<SubstrateState>(DEFAULT_STATE)
  const [networkName, setNetworkName] = useState<string>()

  useEffect(() => {
    if (!connected) return
    let unsub: () => void = () => undefined
    ;(async () => {
      unsub = await api.rpc.system.chain((result) => setNetworkName(result.toString()))
    })()
    return () => unsub()
  }, [api, connected])

  useEffect(() => {
    if (!connected) return
    setConstants({
      chain: networkName,
      genesis: api.genesisHash.toString(),
      chainDecimals: api.registry.chainDecimals[0],
      existentialDeposit: api?.consts?.balances?.existentialDeposit.toNumber(),
      genesisHash: api?.genesisHash.toHex(),
      chainTokens: api.registry.chainTokens[0],
    })
  }, [api, connected, networkName])

  const value = useMemo<SubstrateState>(() => constants, [constants])

  return <SubstrateContext.Provider value={value}>{children}</SubstrateContext.Provider>
}
