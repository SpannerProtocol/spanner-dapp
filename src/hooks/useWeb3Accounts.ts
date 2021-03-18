import { InjectedProvider, InjectedProviderContext } from '../environment/WalletProvider'
import { useContext } from 'react'

export const useWeb3Accounts = (): InjectedProvider => {
  return useContext<InjectedProvider>(InjectedProviderContext)
}
