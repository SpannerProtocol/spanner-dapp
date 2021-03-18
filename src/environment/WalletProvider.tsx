import { isWeb3Injected, web3AccountsSubscribe, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types'
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export interface WalletState {
  selectedAddress?: InjectedAccountWithMeta
  activeAccount?: InjectedAccountWithMeta
  allAccounts?: Array<InjectedAccountWithMeta>
  injector?: InjectedExtension
  errorMsg?: string
}

export interface InjectedProvider extends WalletState {
  createConnection: () => void
  selectAccount: (address: InjectedAccountWithMeta) => void
}

export const InjectedProviderContext = createContext<InjectedProvider>({} as InjectedProvider)

export function Web3InjectedProvider({ children }: any): JSX.Element {
  const [allAccounts, setAllAccounts] = useState<Array<InjectedAccountWithMeta>>()
  const [activeAccount, setActiveAccount] = useState<InjectedAccountWithMeta>()
  const [injector, setInjector] = useState<InjectedExtension>()
  const [connecting, setConnecting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()

  // Calling this function will trigger web3enable. If the user has not approved
  // injected wallets to Spanner Dapp, he will get the extension popup.
  const createConnection = useCallback(() => {
    if (window.injectedWeb3.length === 0) {
      setErrorMsg('Cannot find available compatible wallet extensions.')
      setConnecting(false)
    } else {
      setConnecting(true)
    }
  }, [])

  // A function to select the account object with a matching Addr
  const selectAccount = useCallback(
    (selectedAccount: InjectedAccountWithMeta) => {
      if (!allAccounts) return
      allAccounts.forEach((account: InjectedAccountWithMeta) => {
        if (account.address === selectedAccount.address) {
          setActiveAccount(account)
        }
      })
    },
    [allAccounts]
  )

  const value = useMemo<InjectedProvider>(
    () => ({ activeAccount, allAccounts, injector, errorMsg, createConnection, selectAccount }),
    [activeAccount, allAccounts, injector, errorMsg, createConnection, selectAccount]
  )

  useEffect(() => {
    if (!isWeb3Injected || !connecting) return
    const getAllAccounts = async () => {
      const extensions = await web3Enable('Spanner Protocol')
      if (extensions.length === 0) {
        setErrorMsg('Access to wallet extensions was not provided or none installed.')
        // Reset connecting so that user can try again
        setConnecting(false)
      }
      await web3AccountsSubscribe((accounts) => {
        setAllAccounts(accounts)
      }).catch((err) => console.log(err))
    }
    getAllAccounts()
  }, [connecting])

  useEffect(() => {
    if (!activeAccount) return
    const getInjectedAccount = async (account: InjectedAccountWithMeta) => {
      if (activeAccount) {
        await web3FromSource(account.meta.source).then((injector) => setInjector(injector))
      }
    }
    getInjectedAccount(activeAccount)
  }, [activeAccount])

  return <InjectedProviderContext.Provider value={value}>{children}</InjectedProviderContext.Provider>
}
