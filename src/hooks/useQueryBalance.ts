import { StorageKey } from '@polkadot/types'
import { AccountData, AccountId, AccountInfo } from '@polkadot/types/interfaces'
import { BN_ZERO } from '@polkadot/util'
import BN from 'bn.js'
import { useEffect, useState } from 'react'
import { CurrencyId, TradingPair } from 'spanner-api/types'
import { useApi } from './useApi'
import { useEnabledTradingPairs } from './useQueryTradingPairs'
import useWallet from './useWallet'

export default function useSubscribeBalance(token: string): BN {
  const { api, connected } = useApi()
  const [balance, setBalance] = useState<BN>(BN_ZERO)
  const wallet = useWallet()

  const address = wallet && wallet.address

  useEffect(() => {
    if (!connected || !address) return
    const currencyId: CurrencyId = api.createType('CurrencyId', { Token: token })
    if (currencyId.isToken) {
      if (currencyId.asToken.eq('BOLT')) {
        api.query.system
          .account(address, (result: AccountInfo) => {
            setBalance(result.data.free.toBn())
          })
          .catch(console.error)
      } else if (currencyId.asToken.eq(token)) {
        api.query.tokens
          .accounts(address, currencyId, (result: AccountData) => {
            setBalance(result.free.toBn())
          })
          .catch(console.error)
      }
    }
  }, [api, connected, token, address, balance])

  return balance
}

export function useSubscribeBalances(tokens: string[]): BN[] {
  const { api, connected } = useApi()
  const [balances, setBalances] = useState<BN[]>([...tokens.map(() => BN_ZERO)])
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    const balancesList: BN[] = []
    tokens.forEach((token) => {
      const currencyId: CurrencyId = api.createType('CurrencyId', { Token: token })
      if (currencyId.asToken.eq('BOLT')) {
        api.query.system.account(wallet.address, (result: AccountInfo) => {
          balancesList.push(result.data.free.toBn())
        })
      } else if (currencyId.asToken.eq(token)) {
        api.query.tokens.accounts(wallet.address, currencyId, (result: AccountData) => {
          balancesList.push(result.free.toBn())
        })
      }
    })
    setBalances(balancesList)
  }, [api, connected, tokens, wallet])
  return balances
}

export function useSubAllTokenBalances(): Array<[StorageKey, AccountData]> | undefined {
  const { api, connected } = useApi()
  const [balances, setBalances] = useState<Array<[StorageKey, AccountData]>>()
  const wallet = useWallet()
  const [storageKey, setStorageKey] = useState<StorageKey[]>()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    api.query.tokens.accounts
      .entries(wallet.address)
      .then((entries) => {
        const storageKeys: StorageKey[] = []
        entries.forEach((entry) => {
          storageKeys.push(entry[0])
        })
        setStorageKey(storageKeys)
      })
      .catch((err) => console.log(err))
  }, [api, connected, wallet])

  useEffect(() => {
    if (!connected || !wallet || !wallet.address || !storageKey) return
    let unsub: void | (() => void) = () => undefined
    ;(async () => {
      const currencyIds: [string, CurrencyId][] = []
      storageKey.forEach((key) => {
        if (!wallet.address) return
        const keyCodecs = key.args.map((k) => k)
        const currencyId = (keyCodecs as [AccountId, CurrencyId])[1]
        currencyIds.push([wallet.address, currencyId])
      })
      unsub = await api.query.tokens.accounts.multi(currencyIds, (result) => {
        const accountDatas: [StorageKey, AccountData][] = []
        result.forEach((entry, index) => {
          const accountData = entry as AccountData
          const key = storageKey[index]
          accountDatas.push([key, accountData])
        })
        setBalances(accountDatas)
      })
    })()
    return unsub
  }, [api, connected, wallet, storageKey])

  return balances
}

export interface BalanceData {
  token: string
  type: string
  free: string
  miscFrozen: string
  feeFrozen: string
}

export function useSubAllBalances(): Array<BalanceData> | undefined {
  const { api, connected } = useApi()
  const tokenBalances = useSubAllTokenBalances()
  const [balance, setBalance] = useState<AccountInfo>()
  const [allBalances, setAllBalances] = useState<Array<BalanceData>>()
  const wallet = useWallet()

  useEffect(() => {
    if (!connected || !wallet || !wallet.address) return
    let unsub: () => void = () => undefined
    ;(async () => {
      unsub = await api.query.system.account(wallet.address, (result: AccountInfo) => {
        setBalance(result)
      })
    })()
    return unsub
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
        miscFrozen: accountData.miscFrozen ? accountData.miscFrozen.toString() : '0',
        feeFrozen: accountData.feeFrozen ? accountData.miscFrozen.toString() : '0',
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
