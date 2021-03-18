import { useSelector } from 'react-redux'
import { AppState } from '../index'
import { ConnectionsState } from './reducer'

export function useConnectionsState(): ConnectionsState | undefined {
  return useSelector((state: AppState) => state.connections)
}
