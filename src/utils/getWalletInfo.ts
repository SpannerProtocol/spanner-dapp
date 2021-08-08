import { WalletState } from 'state/wallet/reducer'
import type { InjectedExtension } from '@polkadot/extension-inject/types'
import { Web3Provider } from '@ethersproject/providers'
export interface WalletInfo {
  type?: string
  custodialProvider?: Web3Provider
  injector?: InjectedExtension
  address?: string
  ethereumAddress?: string
  developmentKeyring?: boolean
}

function getUserAddress(walletState: WalletState) {
  return walletState.walletType === 'custodial' ? walletState.custodialAddress : walletState.address
}

// Convenience function for organizing wallet info data
export default function getWalletInfo(
  walletState: WalletState,
  custodialProvider: Web3Provider | undefined,
  injector: InjectedExtension | undefined
): WalletInfo {
  if (!custodialProvider && !injector) return {}
  if (walletState.walletType === 'custodial') {
    // When walletType is custodial, the address = spanner address
    return {
      type: walletState.walletType,
      custodialProvider,
      address: getUserAddress(walletState),
      ethereumAddress: walletState.address,
      developmentKeyring: walletState.developmentKeyring,
    }
  } else if (walletState.walletType === 'non-custodial') {
    return {
      type: walletState.walletType,
      injector,
      address: getUserAddress(walletState),
    }
  } else {
    return {}
  }
}
