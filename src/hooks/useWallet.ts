import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import getWalletInfo, { WalletInfo } from 'utils/getWalletInfo'
import { useWalletManager } from '../state/wallet/hooks'
import { useWeb3Accounts } from './useWeb3Accounts'
import { Web3Provider } from '@ethersproject/providers'

// This hook returns an interface for both custodial and non-custodial wallets
export default function useWallet() {
  const { walletState } = useWalletManager()
  const { injector } = useWeb3Accounts()
  const { library } = useWeb3React<Web3Provider>()
  const [walletInfo, setWalletInfo] = useState<WalletInfo>()

  // Handle wallet info data
  useEffect(() => {
    if (!walletState) return
    setWalletInfo(getWalletInfo(walletState, library, injector))
  }, [walletState, library, injector])

  return walletInfo
}

export function useIsConnected() {
  const wallet = useWallet()
  return wallet?.address ? true : false
}
