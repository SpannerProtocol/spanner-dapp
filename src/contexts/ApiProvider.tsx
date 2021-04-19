import { ApiPromise, WsProvider } from '@polkadot/api'
import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react'
import * as definitions from '../spanner-interfaces/definitions'
import * as rpcDefinitions from '../spanner-interfaces/bulletTrain/rpc'
import { SPANNER_SUPPORTED_CHAINS } from '../constants'
import { useAddChain } from 'state/connections/hooks'

const getEnvVars = () => {
  const APP_NAME = process.env.REACT_APP_APP_NAME
  const PROVIDER_SOCKET = process.env.REACT_APP_SUBSTRATE_PROVIDER_SOCKET
  const DEVELOPMENT_KEYRING = process.env.REACT_APP_DEVELOPMENT_KEYRING
  return {
    APP_NAME,
    DEVELOPMENT_KEYRING,
    PROVIDER_SOCKET,
  }
}

export interface ApiState {
  api: ApiPromise
  connected: boolean
  error: boolean
  loading: boolean
  connectToNetwork: (chain: string) => void
  errorMessage: string | null
}

interface Error {
  name: string
  message: string
  stack?: string
}

export const ApiContext = createContext<ApiState>({} as ApiState)

export function ApiProvider({ children }: any): JSX.Element {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise)
  const [connected, setConnected] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedChain, setSelectedChain] = useState<string>('')
  const [renderLoading, setRenderLoading] = useState<boolean>(false)
  const setChain = useAddChain()

  const config = useMemo(getEnvVars, [])
  const supportedChains = useMemo(() => {
    const chains = SPANNER_SUPPORTED_CHAINS.map((supportedChain) => supportedChain.chain)
    return chains
  }, [])

  const connectToNetwork = useCallback(
    (chain: string) => {
      if (!supportedChains.includes(chain)) return
      if (api.isConnected) {
        api.disconnect()
      }
      setSelectedChain(chain)
    },
    [api, supportedChains]
  )

  const value = useMemo<ApiState>(() => ({ api, error, connected, loading, connectToNetwork, errorMessage }), [
    api,
    error,
    connected,
    loading,
    errorMessage,
    connectToNetwork,
  ])

  useEffect(() => {
    if (!config || !rpcDefinitions) return
    const types = Object.values(definitions).reduce(
      (res, { types }): Record<string, unknown> => ({ ...res, ...types }),
      {}
    )
    const rpc = rpcDefinitions.default.rpc
    // Spanner is default
    let chainInfo = SPANNER_SUPPORTED_CHAINS.find((supportedChain) => supportedChain.chain === selectedChain)
    chainInfo = chainInfo ? chainInfo : SPANNER_SUPPORTED_CHAINS[0]
    chainInfo.chain === 'Spanner Mainnet' ? setChain('Spanner') : setChain('Hammer')
    const provider = new WsProvider(chainInfo.providerSocket)
    const apiPromise = new ApiPromise({
      provider,
      types,
      rpc,
    })

    apiPromise.on('disconnected', () => {
      setLoading(false)
      setConnected(false)
      setError(false)
    })
    apiPromise.on('error', (error: Error) => {
      setErrorMessage(error.message)
      setLoading(false)
      setConnected(false)
      setError(true)
    })
    apiPromise.on('connected', () => {
      setLoading(true)
      setConnected(false)
      setError(false)
    })
    apiPromise.on('ready', () => {
      setApi(apiPromise)
      setLoading(false)
      setConnected(true)
      setError(false)
    })
  }, [config, selectedChain, setChain])

  useEffect(() => {
    if (loading) {
      setRenderLoading(true)
    }
    setRenderLoading(false)
  }, [loading])

  if (renderLoading) {
    return <div>Api is loading</div>
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
