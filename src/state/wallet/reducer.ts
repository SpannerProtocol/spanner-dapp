import { createReducer } from '@reduxjs/toolkit'
import { selectWalletType, enableDevelopmentKeyring } from './actions'

export interface WalletState {
  readonly walletType: string | undefined
  readonly address: string | undefined
  readonly custodialAddress: string | undefined
  readonly developmentKeyring: boolean | undefined
}

const initialState: WalletState = {
  walletType: undefined,
  address: undefined,
  custodialAddress: undefined,
  developmentKeyring: false,
}

export default createReducer<WalletState>(initialState, (builder) =>
  builder
    .addCase(selectWalletType, (state, { payload }) => {
      return {
        ...state,
        walletType: payload.type,
        address: payload.address,
        custodialAddress: payload.custodialAddress,
      }
    })
    .addCase(enableDevelopmentKeyring, (state) => {
      return {
        ...state,
        developmentKeyring: true,
      }
    })
)
