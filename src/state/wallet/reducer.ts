import { createReducer } from '@reduxjs/toolkit'
import { selectWalletType } from './actions'

export interface WalletState {
  readonly walletType: string | undefined
  readonly address: string | undefined
  readonly custodialAddress: string | undefined
}

const initialState: WalletState = {
  walletType: undefined,
  address: undefined,
  custodialAddress: undefined,
}

export default createReducer<WalletState>(initialState, (builder) =>
  builder.addCase(selectWalletType, (state, { payload }) => {
    return {
      ...state,
      walletType: payload.type,
      address: payload.address,
      custodialAddress: payload.custodialAddress,
    }
  })
)
