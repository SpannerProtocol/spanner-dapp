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
import { useChainState } from 'state/connections/hooks'
import { getTargetDpo, getTargetTravelCabin, TravelCabinData } from 'utils/getDpoTargets'
import { getTravelCabinBuyer } from 'utils/getTravelCabinBuyer'
import getTravelCabinInventory from 'utils/getTravelCabinInventory'
import { useApi } from './useApi'
import { useRpcUserDpos } from './useQueryDpos'
import { useRpcUserTravelCabins } from './useQueryTravelCabins'
import useWallet from './useWallet'

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
  const { chain } = useChainState()

  useEffect(() => {
    if (userDpos.length === 0 || !connected || !walletInfo || !walletInfo.address || !chain) return
    const dpoData: UserDposData = {}
    userDpos.forEach((dpoInfo) => {
      dpoData[dpoInfo.index.toString()] = {}
      dpoData[dpoInfo.index.toString()]['manager'] = dpoInfo.manager
      if (dpoInfo.target.isDpo) {
        getTargetDpo(api, dpoInfo).then((result) => {
          if (result.isSome) {
            dpoData[dpoInfo.index.toString()]['target'] = result.unwrapOrDefault()
          }
        })
      } else {
        getTargetTravelCabin(chain.chain, api, walletInfo, dpoInfo).then((result) => {
          dpoData[dpoInfo.index.toString()]['target'] = result
        })
        getTravelCabinInventory(api, dpoInfo.target.asTravelCabin).then((result) => {
          if (result.isSome) {
            dpoData[dpoInfo.index.toString()]['travelCabinInventoryCounts'] = result.unwrapOrDefault()
          }
        })
        getTravelCabinBuyer(api).then((results) => {
          results.forEach((result) => {
            if (result[1].isSome) {
              const travelCabinBuyerInfo = result[1].unwrapOrDefault()
              if (travelCabinBuyerInfo.buyer.isDpo) {
                const buyerIndex = travelCabinBuyerInfo.buyer.asDpo
                if (buyerIndex.eq(dpoInfo.index)) {
                  dpoData[dpoInfo.index.toString()]['travelCabinInventory'] = [
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
  }, [api, connected, userDpos, walletInfo, chain])

  return data
}

export function useUserTravelCabins(address: string | null | undefined) {
  return useRpcUserTravelCabins(address)
}

export function useUserItems(address: string | null | undefined) {
  const userDpos = useUserDpos(address)
  const userTravelCabins = useUserTravelCabins(address)
  return { userDpos, userTravelCabins }
}

export function useUserIsDpoMember(
  dpoIndex: number | string | DpoIndex | undefined,
  address: string | null | undefined
) {
  const { api, connected } = useApi()
  const [isMember, setIsMember] = useState<boolean>(false)

  useEffect(() => {
    if (!address || !connected || !dpoIndex) return
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
