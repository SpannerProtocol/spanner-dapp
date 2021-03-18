import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { useWeb3Accounts } from './useWeb3Accounts'
import BN from 'bn.js'
import { BN_ZERO } from '@polkadot/util'
import { CurrencyId, TradingPair } from 'spanner-interfaces'
import { useEnabledTradingPairs } from './useQueryTradingPairs'
import { AccountData, AccountInfo, AccountId } from '@polkadot/types/interfaces'
import { StorageKey } from '@polkadot/types'
import { useWalletManager } from 'state/wallet/hooks'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import getCustodialAccount from 'utils/getCustodialAccount'
import { WalletState } from 'state/wallet/reducer'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

function getWalletAddress(
  walletState: WalletState,
  spannerAccount: InjectedAccountWithMeta | undefined,
  ethAccount: string | null | undefined
) {
  if (walletState.walletType === 'custodial') {
    return getCustodialAccount(ethAccount as string).address
  }
  return (spannerAccount as InjectedAccountWithMeta).address
}

export default function useSubscribeBalance(currencyObj: object): BN {
  const { api, connected } = useApi()
  const { activeAccount } = useWeb3Accounts()
  const [balance, setBalance] = useState<BN>(BN_ZERO)
  const { walletState } = useWalletManager()
  const { account } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (!connected || !walletState.walletType) return
    const address = getWalletAddress(walletState, activeAccount, account)
    try {
      if (Object.values(currencyObj)[0].length < 1) return
      const currencyId: CurrencyId = api.createType('CurrencyId', currencyObj)
      if (currencyId.isToken && currencyId.asToken.toString().toLowerCase() === 'bolt') {
        api.query.system
          .account(address, (result: AccountInfo) => setBalance(result.data.free.toBn()))
          .catch(console.error)
      } else {
        api.query.tokens
          .accounts(address, currencyId, (result: AccountData) => setBalance(result.free.toBn()))
          .catch(console.error)
      }
    } catch (err) {
      throw err
    }
  }, [api, activeAccount, connected, currencyObj, walletState, account])

  return balance
}

export function useAllTokenBalances(): Array<[StorageKey, AccountData]> | undefined {
  const { api, connected } = useApi()
  const { activeAccount } = useWeb3Accounts()
  const [balances, setBalances] = useState<Array<[StorageKey, AccountData]>>()
  const { walletState } = useWalletManager()
  const { account } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (!connected || !walletState.walletType) return
    const address = getWalletAddress(walletState, activeAccount, account)
    api.query.tokens.accounts
      .entries(address)
      .then((result) => {
        setBalances(result)
      })
      .catch((err) => console.log(err))
  }, [api, activeAccount, connected, walletState, account])

  return balances
}

export interface BalanceData {
  token: string
  type: string
  free: string
  miscFrozen: string
  feeFrozen: string
}

export function useAllBalances(): Array<BalanceData> | undefined {
  const { api, connected } = useApi()
  const { activeAccount } = useWeb3Accounts()
  const tokenBalances = useAllTokenBalances()
  const [balance, setBalance] = useState<AccountInfo>()
  const [allBalances, setAllBalances] = useState<Array<BalanceData>>()
  const { walletState } = useWalletManager()
  const { account } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (!connected || !walletState.walletType) return
    const address = getWalletAddress(walletState, activeAccount, account)
    api.query.system
      .account(address)
      .then((result) => {
        setBalance(result)
      })
      .catch((err) => console.log(err))
  }, [api, activeAccount, walletState, account, connected])

  useEffect(() => {
    if (!tokenBalances || !balance) return
    const tokenBalanceData: Array<BalanceData> = tokenBalances.map(([key, accountData]) => {
      const keyCodecs = key.args.map((k) => k)
      const currencyId = (keyCodecs as [AccountId, CurrencyId])[1]
      const type = currencyId.isToken ? 'token' : 'lp'
      const token = currencyId.isToken
        ? currencyId.asToken.toString()
        : currencyId.asDexShare[0].toString() + '/' + currencyId.asDexShare[1].toString()
      return {
        token,
        type,
        free: accountData.free.toString(),
        miscFrozen: accountData.miscFrozen.toString(),
        feeFrozen: accountData.feeFrozen.toString(),
      }
    })
    const boltBalanceData = {
      token: 'BOLT',
      type: 'token',
      free: balance.data.free.toString(),
      miscFrozen: balance.data.miscFrozen.toString(),
      feeFrozen: balance.data.feeFrozen.toString(),
    }
    setAllBalances([boltBalanceData, ...tokenBalanceData])
  }, [tokenBalances, balance])

  return allBalances
}

export interface LpBalance {
  currencyId: Array<string>
  balance: AccountData
  poolPair: TradingPair
}

export function useAllLpBalances(): Array<LpBalance> {
  const { api, connected } = useApi()
  const { activeAccount } = useWeb3Accounts()
  const [balances, setBalances] = useState<Array<LpBalance>>([])
  const enabledTradingPairs = useEnabledTradingPairs()
  const { walletState } = useWalletManager()
  const { account } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (!connected || !walletState.walletType) return
    if (!activeAccount && !account) return
    const address = getWalletAddress(walletState, activeAccount, account)
    enabledTradingPairs.forEach((pair) => {
      const validPair = [pair[0].asToken.toString(), pair[1].asToken.toString()]
      api.query.tokens.accounts(address, { DEXShare: validPair }, (result: AccountData) => {
        if (result.free.isZero()) return
        setBalances((prevBalances) => [...prevBalances, { currencyId: validPair, balance: result, poolPair: pair }])
      })
    })
  }, [api, activeAccount, connected, enabledTradingPairs, walletState, account])

  return balances
}
