import { StorageKey } from '@polkadot/types'
import { AccountData, AccountId, AccountInfo } from '@polkadot/types/interfaces'
import { BN_ZERO } from '@polkadot/util'
import BN from 'bn.js'
import { useEffect, useState } from 'react'
import { CurrencyId, TradingPair } from 'spanner-interfaces'
import { useApi } from './useApi'
import { useEnabledTradingPairs } from './useQueryTradingPairs'
import useWallet from './useWallet'

export default function useSubscribeBalance(currencyObj: object): BN {
  const { api, connected } = useApi()
  const [balance, setBalance] = useState<BN>(BN_ZERO)
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    try {
      if (Object.values(currencyObj)[0].length < 1) return
      const currencyId: CurrencyId = api.createType('CurrencyId', currencyObj)
      if (currencyId.isToken && currencyId.asToken.toString().toLowerCase() === 'bolt') {
        api.query.system
          .account(wallet.address, (result: AccountInfo) => setBalance(result.data.free.toBn()))
          .catch(console.error)
      } else {
        api.query.tokens
          .accounts(wallet.address, currencyId, (result: AccountData) => setBalance(result.free.toBn()))
          .catch(console.error)
      }
    } catch (err) {
      throw err
    }
  }, [api, connected, currencyObj, wallet])

  return balance
}

export function useAllTokenBalances(): Array<[StorageKey, AccountData]> | undefined {
  const { api, connected } = useApi()
  const [balances, setBalances] = useState<Array<[StorageKey, AccountData]>>()
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    api.query.tokens.accounts
      .entries(wallet.address)
      .then((result) => {
        setBalances(result)
      })
      .catch((err) => console.log(err))
  }, [api, connected, wallet])

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
  const tokenBalances = useAllTokenBalances()
  const [balance, setBalance] = useState<AccountInfo>()
  const [allBalances, setAllBalances] = useState<Array<BalanceData>>()
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    api.query.system
      .account(wallet.address)
      .then((result) => {
        setBalance(result)
      })
      .catch((err) => console.log(err))
  }, [api, connected, wallet])

  useEffect(() => {
    if (!tokenBalances || !balance) return
    const tokenBalanceData: Array<BalanceData> = tokenBalances.map(([key, accountData]) => {
      const keyCodecs = key.args.map((k) => k)
      const currencyId = (keyCodecs as [AccountId, CurrencyId])[1]
      const type = currencyId.isToken ? 'Token' : 'Liq. Pool'
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
      type: 'Token',
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
  dexSharePair: TradingPair
}

export function useAllLpBalances(): Array<LpBalance> {
  const { api, connected } = useApi()
  const [balances, setBalances] = useState<Array<LpBalance>>([])
  const enabledTradingPairs = useEnabledTradingPairs()
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    enabledTradingPairs.forEach((pair) => {
      const validPair = [pair[0].asToken.toString(), pair[1].asToken.toString()]
      api.query.tokens.accounts(wallet.address, { DEXShare: validPair }, (result: AccountData) => {
        if (result.free.isZero()) return
        setBalances((prevBalances) => [...prevBalances, { currencyId: validPair, balance: result, dexSharePair: pair }])
      })
    })
  }, [api, connected, enabledTradingPairs, wallet])

  return balances
}
