import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enableDevelopmentKeyring, selectWalletType, Wallet } from 'state/wallet/actions'
import { AppDispatch, AppState } from '../index'
import { WalletState } from './reducer'

export function useWalletState(): AppState['wallet'] {
  return useSelector<AppState, AppState['wallet']>((state) => state.wallet)
}

interface WalletManagerState {
  walletState: WalletState
  setWalletType: (wallet: Wallet) => void
  setDevelopmentKeyring: () => void
}

export function useWalletManager(): WalletManagerState {
  const walletState = useWalletState()
  const dispatch = useDispatch<AppDispatch>()

  const setWalletType = useCallback(
    (wallet: Wallet) => {
      dispatch(selectWalletType(wallet))
    },
    [dispatch]
  )

  const setDevelopmentKeyring = useCallback(() => {
    dispatch(enableDevelopmentKeyring())
  }, [dispatch])

  return { walletState, setWalletType, setDevelopmentKeyring }
}
