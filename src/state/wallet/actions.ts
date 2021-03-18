import { createAction } from '@reduxjs/toolkit'
export interface Wallet {
  type: string
  address?: string
  custodialAddress?: string
}

export const selectWalletType = createAction<Wallet>('wallet/selectWalletType')
