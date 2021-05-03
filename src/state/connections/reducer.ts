import { createReducer } from '@reduxjs/toolkit'
import { addBridgeServer, addChain } from './actions'

export interface ConnectionsState {
  readonly bridgeServerOn: boolean
  readonly chain: 'Hammer' | 'Spanner'
  readonly apiConnected: boolean
  readonly apiLoading: boolean
}

const initialState: ConnectionsState = {
  bridgeServerOn: false,
  chain: 'Spanner',
  apiConnected: false,
  apiLoading: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addBridgeServer, (state, { payload }) => {
      state.bridgeServerOn = payload
    })
    .addCase(addChain, (state, { payload }) => {
      state.chain = payload
    })
)
