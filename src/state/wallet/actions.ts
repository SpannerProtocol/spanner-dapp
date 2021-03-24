import { createAction } from '@reduxjs/toolkit'
export interface Wallet {
  type: string
  address?: string
  custodialAddress?: string
  developmentKeyring?: boolean
}

export const selectWalletType = createAction<Wallet>('wallet/selectWalletType')
export const enableDevelopmentKeyring = createAction('wallet/enableDevelopmentKeyring')
