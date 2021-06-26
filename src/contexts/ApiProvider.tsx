import { ApiPromise, WsProvider } from '@polkadot/api'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useChainState } from 'state/connections/hooks'
import { SPANNER_SUPPORTED_CHAINS } from '../constants'
import * as rpcDefinitions from '../spanner-interfaces/bulletTrain/rpc'
import * as definitions from '../spanner-interfaces/definitions'
import { useApiToastContext } from './ApiToastProvider'

interface ApiInternalState {
  api: ApiPromise
  connected: boolean
  error: boolean
  loading: boolean
  chain: string
  needReconnect: boolean
}

export interface ApiState extends ApiInternalState {
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
  const { toastDispatch } = useApiToastContext()
  const pageVisible = useIsWindowVisible()

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
          console.log()
          setApiState((prev) => ({ ...prev, loading: false, connected: false, needReconnect: true }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Disconnected from ${chainToConnect}`,
              type: 'warning',
            },
          })
        })
        apiPromise.on('error', () => {
          setApiState((prev) => ({ ...prev, loading: false, connected: false, needReconnect: true, error: true }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Connection error`,
              type: 'danger',
            },
          })
        })
        apiPromise.on('connected', () => {
          setApiState((prev) => ({ ...prev, chain: `${chainToConnect}`, loading: true }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Connecting to ${chainToConnect}`,
              type: 'info',
            },
          })
        })
        apiPromise.on('ready', () => {
          setApiState((prev) => ({
            ...prev,
            api: apiPromise,
            loading: false,
            connected: true,
            error: false,
          }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Connected to ${chainToConnect}`,
              type: 'success',
            },
          })
          console.log('api ready', new Date().toLocaleTimeString())
        })
      } catch (e) {
        console.log('connection error', e)
      }
    },
    [addChain, toastDispatch]
  )

  const connectToNetwork = useCallback(
    async (chain: string) => {
      if (!supportedChains.includes(chain)) return
      if (Object.keys(apiState.api).length > 0) {
        const apiInstance = await apiState.api.isReadyOrError
        apiInstance.disconnect()
      }
      // Save to component state for reconnect if necessary
      setSelectedChain(chain)
      console.log('api start', new Date().toLocaleTimeString())
      createApi(chain)
    },
    [apiState.api, createApi, supportedChains]
  )

  // init
  useEffect(() => {
    createApi(selectedChain)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Only calling createApi if page is visible. This avoids unnecessary websocket instances.
  useEffect(() => {
    if (apiState.needReconnect && pageVisible) {
      console.log('api start', new Date().toLocaleTimeString())
      createApi(selectedChain)
      setApiState((prev) => ({
        ...prev,
        needReconnect: false,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisible])

  const value = useMemo<ApiState>(() => ({ ...apiState, connectToNetwork }), [apiState, connectToNetwork])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
