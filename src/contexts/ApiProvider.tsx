import { ApiPromise, WsProvider } from '@polkadot/api'
import { SText } from 'components/Text'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { SPANNER_SUPPORTED_CHAINS } from '../constants'
import * as rpcDefinitions from '../spanner-interfaces/bulletTrain/rpc'
import * as definitions from '../spanner-interfaces/definitions'
import { useApiToastContext } from './ApiToastProvider'
import { RefreshCw } from 'react-feather'
import { RowFixed } from 'components/Row'
import { ThemeContext } from 'styled-components'
import { createPortal } from 'react-dom'
import MaintenanceModal from '../components/Modal/MaintenanceModal'

interface ApiInternalState {
  api: ApiPromise
  lastState: 'error' | 'disconnected' | 'connected' | 'ready'
  connected: boolean
  chain: string
  needReconnect: boolean
}

function ConnectedTooLong({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  return (
    <RowFixed onClick={onClick}>
      <SText padding="0 0.5rem 0 0">{t(`Click to refresh`)}</SText>
      <RefreshCw size={12} color={theme.gray1} />
    </RowFixed>
  )
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
    needReconnect: false,
    lastState: 'disconnected',
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
          setApiState((prev) => ({ ...prev, connected: false, needReconnect: true, lastState: 'disconnected' }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Disconnected from ${chainToConnect}`,
              type: 'warning',
            },
          })
        })
        apiPromise.on('error', () => {
          setApiState((prev) => ({ ...prev, connected: false, needReconnect: true, lastState: 'error' }))
          toastDispatch({
            type: 'ADD',
            payload: {
              title: `Connection error`,
              type: 'danger',
            },
          })
        })
        apiPromise.on('connected', () => {
          // sometimes the api returns connected instead of ready even tho the provider is connected
          if (apiPromise.isConnected) {
            setApiState((prev) => ({ ...prev, chain: `${chainToConnect}`, lastState: 'ready' }))
            toastDispatch({
              type: 'ADD',
              payload: {
                title: `Connected to ${chainToConnect}`,
                type: 'success',
              },
            })
          } else {
            setApiState((prev) => ({ ...prev, chain: `${chainToConnect}`, lastState: 'connected' }))
            toastDispatch({
              type: 'ADD',
              payload: {
                title: `Connecting to ${chainToConnect}`,
                type: 'info',
                jsxElement: <ConnectedTooLong onClick={() => createApi(chainToConnect)} />,
              },
            })
          }
        })
        apiPromise.on('ready', () => {
          setApiState((prev) => ({
            ...prev,
            api: apiPromise,
            connected: true,
            lastState: 'ready',
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
      console.log(chain, supportedChains)
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

  const [chainUpgradeModalOpen, setChainUpgradeModalOpen] = useState<boolean>(false)

  const dismissChainUpgradeModal = () => {
    setChainUpgradeModalOpen(false)
  }

  useEffect(() => {
    const HAMMER_MAINTENANCE = process.env.REACT_APP_HAMMER_MAINTENANCE === 'true'
    const SPANNER_MAINTENANCE = process.env.REACT_APP_SPANNER_MAINTENANCE === 'true'
    setChainUpgradeModalOpen(false)
    if (chain && chain.chain === 'Spanner' && SPANNER_MAINTENANCE) {
      setChainUpgradeModalOpen(true)
    }
    if (chain && chain.chain === 'Hammer' && HAMMER_MAINTENANCE) {
      setChainUpgradeModalOpen(true)
    }
  }, [chain])

  return (
    <ApiContext.Provider value={value}>
      {children}
      {createPortal(
        <MaintenanceModal isOpen={chainUpgradeModalOpen} onDismiss={dismissChainUpgradeModal} chain={selectedChain} />,
        document.body
      )}
    </ApiContext.Provider>
  )
}
