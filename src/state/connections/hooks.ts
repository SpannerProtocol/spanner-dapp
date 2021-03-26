import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { addBridgeServer } from './actions'
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
