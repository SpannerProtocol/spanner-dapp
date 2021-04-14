import { createReducer } from '@reduxjs/toolkit'
import { addBridgeServer, addChain } from './actions'

export interface ConnectionsState {
  readonly bridgeServerOn: boolean
  readonly chain: 'Hammer' | 'Spanner'
}

const initialState: ConnectionsState = {
  bridgeServerOn: false,
  chain: 'Spanner',
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
