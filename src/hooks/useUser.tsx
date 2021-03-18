import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import {
  DpoIndex,
  DpoInfo,
  DpoMemberInfo,
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'spanner-interfaces/bulletTrain'
import { useWalletManager } from 'state/wallet/hooks'
import { getTargetDpo, getTargetTravelCabin, TravelCabinData } from 'utils/getDpoTargets'
import { getTravelCabinBuyer } from 'utils/getTravelCabinBuyer'
import getTravelCabinInventory from 'utils/getTravelCabinInventory'
import { useApi } from './useApi'
import { useRpcUserDpos } from './useQueryDpos'
import { useRpcUserTravelCabins } from './useQueryTravelCabins'
import useWallet from './useWallet'
import { useWeb3Accounts } from './useWeb3Accounts'

export function useUserDpos(address: string | null | undefined) {
  return useRpcUserDpos(address)
}

interface DpoData {
  manager: DpoMemberInfo
  target: [TravelCabinInfo, TravelCabinData] | DpoInfo
  dpoInfo: DpoInfo
  travelCabinInventory?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  travelCabinInventoryCounts?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
}

interface UserDposData {
  [index: string]: DpoData | any
}

/**
 * A heavier function that gets all the Dpo Data for a given user address.
 * Produces a dictionary indexable by dpoIndex.
 * */
export function useUserDposData(address: string | null | undefined): UserDposData {
  const { api, connected } = useApi()
  const walletInfo = useWallet()
  const userDpos = useRpcUserDpos(address)
  const [data, setData] = useState<UserDposData>({})

  useEffect(() => {
    if (!userDpos || userDpos.length === 0 || !connected || !walletInfo || !walletInfo.address) return
    const dpoData: UserDposData = {}
    userDpos.forEach(([dpoIndex, dpoInfo]) => {
      dpoData[dpoIndex.toString()] = {}
      dpoData[dpoIndex.toString()]['manager'] = dpoInfo.manager
      if (dpoInfo.target.isDpo) {
        getTargetDpo(api, dpoInfo).then((result) => {
          if (result.isSome) {
            dpoData[dpoIndex.toString()]['target'] = result.unwrapOrDefault()
          }
        })
      } else {
        getTargetTravelCabin(api, walletInfo, dpoInfo).then((result) => {
          dpoData[dpoIndex.toString()]['target'] = result
        })
        getTravelCabinInventory(api, dpoInfo.target.asTravelCabin).then((result) => {
          if (result.isSome) {
            dpoData[dpoIndex.toString()]['travelCabinInventoryCounts'] = result.unwrapOrDefault()
          }
        })
        getTravelCabinBuyer(api).then((results) => {
          results.forEach((result) => {
            if (result[1].isSome) {
              const travelCabinBuyerInfo = result[1].unwrapOrDefault()
              if (travelCabinBuyerInfo.buyer.isDpo) {
                const buyerIndex = travelCabinBuyerInfo.buyer.asDpo
                if (buyerIndex.eq(dpoIndex)) {
                  dpoData[dpoIndex.toString()]['travelCabinInventory'] = [
                    [result[0][0], result[0][1]],
                    result[1].unwrapOrDefault(),
                  ]
                }
              }
            }
          })
        })
      }
    })
    setData(dpoData)
  }, [api, connected, userDpos, walletInfo])

  return data
}

export function useUserTravelCabins(address: string | null | undefined) {
  return useRpcUserTravelCabins(address)
}
// needs to fix
export function useUserItems(address: string | null | undefined) {
  const userDpos = useUserDpos(address)
  const userTravelCabins = useUserTravelCabins(address)
  return { userDpos, userTravelCabins }
}

export function useUserIsDpoMember(dpoIndex: number | string | DpoIndex, address: string | null | undefined) {
  const { api, connected } = useApi()
  const [isMember, setIsMember] = useState<boolean>(false)

  useEffect(() => {
    if (!address || !connected) return
    api.query.bulletTrain.dpoMembers.entries(dpoIndex).then((result) => {
      result.forEach((member) => {
        if (member[1].isNone) return
        if (
          member[1].unwrapOrDefault().buyer.isPassenger &&
          member[1].unwrapOrDefault().buyer.asPassenger.eq(address)
        ) {
          setIsMember(true)
        }
      })
    })
  }, [api, connected, address, dpoIndex])

  return isMember
}

export function useUserIsDpoManager(dpoIndex: number | string | DpoIndex, address: string | undefined) {
  const { api, connected } = useApi()
  const [isManager, setIsManager] = useState<boolean>(false)

  useEffect(() => {
    if (!address || !connected) return
    api.query.bulletTrain.dpos(dpoIndex, (result) => {
      if (result.isNone) return
      if (result.unwrapOrDefault().manager.eq(address)) {
        setIsManager(true)
      }
    })
  }, [api, connected, address, dpoIndex])
  return isManager
}

export function useUserInDpo(dpoIndex: number | string | DpoIndex, address: string | undefined) {
  const isMember = useUserIsDpoMember(dpoIndex, address)
  const isManager = useUserIsDpoManager(dpoIndex, address)
  if (isMember || isManager) {
    return {
      inDpo: true,
      role: isManager ? 'Manager' : isMember ? 'Member' : undefined,
    }
  } else {
    return { inDpo: false, role: undefined }
  }
}

export function useUserAddress() {
  const { walletState } = useWalletManager()
  const { activeAccount } = useWeb3Accounts()
  const { account } = useWeb3React()
  const [userAccount, setUserAccount] = useState<string>()

  useEffect(() => {
    if (!walletState) return
    if (!(account && activeAccount))
      if (walletState.walletType === 'custodial' && account) {
        setUserAccount(account)
      } else if (walletState.walletType === 'non-custodial' && activeAccount) {
        setUserAccount(activeAccount.address)
      }
  }, [activeAccount, account, walletState])

  return userAccount
}
