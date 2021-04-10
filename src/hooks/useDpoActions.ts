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
import { getTravelCabinBuyer } from 'utils/getTravelCabinBuyer'
import getTravelCabinInventory from 'utils/getTravelCabinInventory'
import { WalletInfo } from 'utils/getWalletInfo'
import { useApi } from './useApi'
import { useBlockManager } from './useBlocks'
import useWallet from './useWallet'
import type { BlockNumber } from '@polkadot/types/interfaces'
import { useUserIsDpoMember } from './useUser'

interface ActionReq {
  dpoInfo?: DpoInfo
  lastBlock?: BlockNumber
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetTravelCabinInventory?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
  targetDpo?: DpoInfo
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

  const addActionReq = useCallback((newAction: NewActionReq) => {
    setActionsReq((prev) => {
      return { ...prev, ...newAction }
    })
  }, [])

  useEffect(() => {
    if (!connected || !wallet || !wallet.address || !dpoInfo) return
    if (dpoInfo.target.isDpo) {
      getTargetDpo(api, dpoInfo).then((result) => {
        if (result.isSome) {
          addActionReq({ targetDpo: result.unwrapOrDefault() })
        }
      })
    } else {
      getTargetTravelCabin(api, wallet, dpoInfo).then((result) => {
        if (result) {
          addActionReq({ targetTravelCabin: result[0] })
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
  }, [addActionReq, api, connected, dpoInfo, wallet])

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
    targetDpo: actionsReq?.targetDpo,
  }
}
