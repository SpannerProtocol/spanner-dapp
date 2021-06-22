import { ApiPromise, WsProvider } from '@polkadot/api'
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useChainState } from 'state/connections/hooks'
import { SPANNER_SUPPORTED_CHAINS } from '../constants'
import * as rpcDefinitions from '../spanner-interfaces/bulletTrain/rpc'
import * as definitions from '../spanner-interfaces/definitions'

interface ApiInternalState {
  api: ApiPromise
  connected: boolean
  error: boolean
  loading: boolean
  chain: string
  needReconnect: boolean
}

export interface ApiState extends ApiInternalState {
  reconnect: () => void
  connectToNetwork: (chain: string) => void
}

export const ApiContext = createContext<ApiState>({} as ApiState)

export function ApiProvider({ children }: any): JSX.Element {
  const [apiState, setApiState] = useState<ApiInternalState>({
    api: {} as ApiPromise,
    connected: false,
    chain: '',
    error: false,
    loading: false,
    needReconnect: false,
  })
  const { chain, addChain } = useChainState()
  const [selectedChain, setSelectedChain] = useState<string>(chain ? chain.chainName : '')

  const supportedChains = useMemo(() => {
    const chains = SPANNER_SUPPORTED_CHAINS.map((supportedChain) => supportedChain.chain)
    return chains
  }, [])

  const createApi = useCallback(
    (chainToConnect: string) => {
      const types = Object.values(definitions).reduce(
        (res, { types }): Record<string, unknown> => ({ ...res, ...types }),
        {}
      )
      try {
        const rpc = rpcDefinitions.default.rpc
        let chainInfo = SPANNER_SUPPORTED_CHAINS.find((supportedChain) => supportedChain.chain === chainToConnect)
        chainInfo = chainInfo ? chainInfo : SPANNER_SUPPORTED_CHAINS[0]
        chainInfo.chain === 'Spanner Mainnet' ? addChain('Spanner') : addChain('Hammer')
        const provider = new WsProvider(chainInfo.providerSocket)
        const apiPromise = new ApiPromise({
          provider,
          types,
          rpc,
        })

        apiPromise.on('disconnected', () => {
          console.log('disconnect')
          setApiState((prev) => ({ ...prev, loading: false, connected: false, needReconnect: true }))
        })
        apiPromise.on('error', () => {
          console.log('error')
          setApiState((prev) => ({ ...prev, loading: false, connected: false, needReconnect: true, error: true }))
          apiPromise.disconnect()
        })
        apiPromise.on('connected', () => {
          setApiState((prev) => ({ ...prev, chain: `${chainToConnect}`, loading: true }))
        })
        apiPromise.on('ready', () => {
          setApiState((prev) => ({
            ...prev,
            api: apiPromise,
            loading: false,
            connected: true,
            needReconnect: false,
            error: false,
          }))
        })
      } catch (e) {
        console.log('connection error', e)
      }
    },
    [addChain]
  )

  const connectToNetwork = useCallback(
    async (chain: string) => {
      if (!supportedChains.includes(chain)) return
      if (Object.keys(apiState.api).length > 0) {
        const apiInstance = await apiState.api.isReadyOrError
        apiInstance.disconnect()
      }
      createApi(chain)
      // Save to component state for reconnect if necessary
      setSelectedChain(chain)
    },
    [apiState, createApi, supportedChains]
  )

  const reconnect = useCallback(() => createApi(selectedChain), [selectedChain, createApi])

  useEffect(() => {
    createApi(selectedChain)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<ApiState>(() => ({ ...apiState, connectToNetwork, reconnect }), [
    apiState,
    connectToNetwork,
    reconnect,
  ])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
