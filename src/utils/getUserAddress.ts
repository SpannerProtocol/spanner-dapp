import { WalletState } from 'state/wallet/reducer'

export default function getUserAddress(walletState: WalletState) {
  return walletState.walletType === 'custodial' ? walletState.custodialAddress : walletState.address
}
