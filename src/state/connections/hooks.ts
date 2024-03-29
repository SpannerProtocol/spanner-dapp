import { DAPP_CHAIN, HAMMER_EXPLORER, SPANNER_EXPLORER } from '../../constants'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { addBridgeServer, addChain } from './actions'
import { ConnectionsState } from './reducer'

export function useConnectionsState(): ConnectionsState | undefined {
  return useSelector((state: AppState) => state.connections)
}

export function useAddBridgeServer() {
  const dispatch = useDispatch<AppDispatch>()
  const setBridgeServerOn = useCallback(
    (isOn: boolean) => {
      dispatch(addBridgeServer(isOn))
    },
    [dispatch]
  )
  return setBridgeServerOn
}

export function useAddChain() {
  const dispatch = useDispatch<AppDispatch>()
  const setChain = useCallback(
    (chain: 'Hammer' | 'Spanner') => {
      dispatch(addChain(chain))
    },
    [dispatch]
  )
  return setChain
}

export function useChainState() {
  // const connections = useConnectionsState()
  const addChain = useAddChain()
  // const chain = useMemo(() => {
  //   if (connections) {
  //     return {
  //       chain: connections.chain,
  //       chainName: connections.chain === 'Spanner' ? 'Spanner Mainnet' : 'Hammer Testnet',
  //       url: connections.chain === 'Spanner' ? SPANNER_EXPLORER : HAMMER_EXPLORER,
  //     }
  //   }
  // }, [connections])
  const chain: {
    chain: 'Spanner' | 'Hammer'
    chainName: string
    url?: string
  } = useMemo(
    () => ({
      chain: DAPP_CHAIN === 'Spanner' ? 'Spanner' : 'Hammer',
      chainName: DAPP_CHAIN === 'Spanner' ? 'Spanner Mainnet' : 'Hammer Testnet',
      url: DAPP_CHAIN === 'Spanner' ? SPANNER_EXPLORER : HAMMER_EXPLORER,
    }),
    []
  )
  return { chain, addChain }
}
