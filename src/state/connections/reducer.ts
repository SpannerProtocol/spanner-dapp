import { addBridgeServer } from './actions'
import { createReducer } from '@reduxjs/toolkit'

export interface ConnectionsState {
  readonly bridgeServerOn: boolean
}

const initialState: ConnectionsState = {
  bridgeServerOn: false,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(addBridgeServer, (state, { payload }) => {
    state.bridgeServerOn = payload
  })
)
