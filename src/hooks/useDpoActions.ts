import { useCallback, useEffect, useState } from 'react'
import {
  DpoInfo,
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'spanner-interfaces'
import getDpoActions, { DpoAction } from 'utils/getDpoActions'
import { getTargetDpo, getTargetTravelCabin } from 'utils/getDpoTargets'
import { getDpoCabinInventoryIndex, getTravelCabinBuyer } from 'utils/getTravelCabinBuyer'
import getTravelCabinInventory from 'utils/getTravelCabinInventory'
import { WalletInfo } from 'utils/getWalletInfo'
import { useApi } from './useApi'
import { useBlockManager } from './useBlocks'
import useWallet from './useWallet'
import type { BlockNumber } from '@polkadot/types/interfaces'
import { useUserIsDpoMember } from './useUser'
import { getDpoMembers } from 'utils/getDpoMembers'
import { useChainState } from 'state/connections/hooks'
// import { useQuery } from '@apollo/client'
// import {
//   ExtrinsicsBySectionAndMethods,
//   ExtrinsicsBySectionAndMethodsVariables,
// } from 'queries/graphql/types/ExtrinsicsBySectionAndMethods'
// import { extrinsicsBySectionAndMethods } from 'queries/graphql/extrinsics'

interface ActionReq {
  dpoInfo?: DpoInfo
  lastBlock?: BlockNumber
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetTravelCabinInventory?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
  targetTravelCabinInventoryIndex?: TravelCabinInventoryIndex
  targetDpo?: DpoInfo
  dpoIsMemberOfTargetDpo?: boolean
  walletInfo?: WalletInfo
}

interface NewActionReq {
  [index: string]:
    | DpoInfo
    | BlockNumber
    | WalletInfo
    | TravelCabinInfo
    | [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
    | [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
    | boolean
}

// targetTravelCabin and targetTravelCabinInventory are mandatory for all cabin target related actions
const travelCabinKeys = ['targetTravelCabin', 'targetTravelCabinInventory']

// Get all actions for a single DPO
export function useDpoActions(dpoInfo: DpoInfo | undefined) {
  const { api, connected } = useApi()
  const { lastBlock } = useBlockManager()
  const wallet = useWallet()
  const isMember = useUserIsDpoMember(dpoInfo?.index, wallet?.address)
  const [actionsReq, setActionsReq] = useState<ActionReq>()
  const [dpoActions, setDpoActions] = useState<DpoAction[]>()
  const { chain } = useChainState()

  const addActionReq = useCallback((newAction: NewActionReq) => {
    setActionsReq((prev) => {
      return { ...prev, ...newAction }
    })
  }, [])

  useEffect(() => {
    if (!connected || !wallet || !wallet.address || !dpoInfo || !chain) return
    if (dpoInfo.target.isDpo) {
      getTargetDpo(api, dpoInfo).then((result) => {
        if (result.isSome) {
          addActionReq({ targetDpo: result.unwrapOrDefault() })
        }
      })
      // Get Target DPO's members to check if dpo is a member already
      getDpoMembers(api, dpoInfo.target.asDpo[0]).then((results) => {
        results.forEach((result) => {
          if (result[1].isSome) {
            const dpoMember = result[1].unwrapOrDefault()
            if (dpoMember.buyer.isDpo) {
              dpoMember.buyer.asDpo.eq(dpoInfo.index) && addActionReq({ dpoIsMemberOfTargetDpo: true })
            }
          }
        })
      })
    } else {
      getTargetTravelCabin(api, dpoInfo).then((result) => {
        if (result && result.isSome) {
          addActionReq({ targetTravelCabin: result.unwrapOrDefault() })
        }
      })
      getDpoCabinInventoryIndex(api, dpoInfo).then((result) => {
        if (result) {
          addActionReq({ targetTravelCabinInventoryIndex: result[1] })
        }
      })
      getTravelCabinInventory(api, dpoInfo.target.asTravelCabin).then((result) => {
        if (result.isSome) {
          addActionReq({ targetTravelCabinInventory: result.unwrapOrDefault() })
        }
      })
      getTravelCabinBuyer(api).then((results) => {
        results.forEach((result) => {
          if (result[1].isSome) {
            const travelCabinBuyerInfo = result[1].unwrapOrDefault()
            if (travelCabinBuyerInfo.buyer.isDpo) {
              const buyerIndex = travelCabinBuyerInfo.buyer.asDpo
              if (buyerIndex.eq(dpoInfo.index)) {
                addActionReq({ targetTravelCabinBuyer: [result[0].args, result[1].unwrapOrDefault()] })
              }
            }
          }
        })
      })
    }
  }, [addActionReq, api, connected, dpoInfo, wallet, chain])

  // Every block change causes a rerender might might be necessary if we want
  // the DPO State and Actions to update.
  useEffect(() => {
    if (!lastBlock || !wallet || !dpoInfo || !actionsReq) return
    // If DPOInfo, just need dpoInfo, else need all keys in travelCabinKeys
    if (
      Object.keys(actionsReq).includes('targetDpo') ||
      travelCabinKeys.every((key) => Object.keys(actionsReq).includes(key))
    ) {
      const allActions = getDpoActions({
        dpoInfo,
        lastBlock,
        walletInfo: wallet,
        isMember,
        ...actionsReq,
      })
      setDpoActions(allActions)
    }
  }, [lastBlock, wallet, actionsReq, dpoInfo, isMember])

  return {
    dpoActions,
    targetTravelCabin: actionsReq?.targetTravelCabin,
    targetTravelCabinBuyer: actionsReq?.targetTravelCabinBuyer,
    targetTravelCabinInventory: actionsReq?.targetTravelCabinInventory,
    targetTravelCabinInventoryIndex: actionsReq?.targetTravelCabinInventoryIndex,
    targetDpo: actionsReq?.targetDpo,
  }
}
