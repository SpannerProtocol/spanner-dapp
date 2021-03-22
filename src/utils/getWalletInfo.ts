import { WalletState } from 'state/wallet/reducer'
import type { InjectedExtension } from '@polkadot/extension-inject/types'
import { Web3Provider } from '@ethersproject/providers'
import getUserAddress from 'utils/getUserAddress'
import Keyring from '@polkadot/keyring'
import { u8aToHex } from '@polkadot/util'
export interface WalletInfo {
  type?: string
  custodialProvider?: Web3Provider
  injector?: InjectedExtension
  address?: string
  ethereumAddress?: string
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

export function getUserPublicKey(address: string) {
  const keyring = new Keyring()
  const account = keyring.addFromAddress(address)
  return u8aToHex(account.publicKey)
}
