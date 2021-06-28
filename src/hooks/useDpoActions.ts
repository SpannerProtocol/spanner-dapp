import type { BlockNumber } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import {
  DpoInfo,
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'spanner-interfaces'
import getDpoActions, { DpoAction } from 'utils/getDpoActions'
import { getTargetTravelCabin } from 'utils/getDpoTargets'
import { getDpoTargetCabinBuyer } from 'utils/getTravelCabinBuyer'
import { useApi } from './useApi'
import { useBlockManager } from './useBlocks'

interface ActionReq {
  dpoInfo?: DpoInfo
  selectedState?: string
  lastBlock?: BlockNumber
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetDpo?: DpoInfo
}

// Get all actions for a single DPO
export function useDpoActions(dpoInfo: DpoInfo | undefined, selectedState?: string) {
  const { api, connected } = useApi()
  const { lastBlock } = useBlockManager()
  const [actionsReq, setActionsReq] = useState<ActionReq>()
  const [dpoActions, setDpoActions] = useState<DpoAction[]>()

  useEffect(() => {
    if (!connected || !dpoInfo) return
    ;(async () => {
      const req: ActionReq = {}
      if (dpoInfo.target.isTravelCabin) {
        const targetTravelCabin = await getTargetTravelCabin(api, dpoInfo)
        if (targetTravelCabin && targetTravelCabin.isSome) {
          req.targetTravelCabin = targetTravelCabin.unwrapOrDefault()
        }
        const buyer = await getDpoTargetCabinBuyer(api, dpoInfo)
        if (buyer) {
          req.targetTravelCabinBuyer = buyer
        }
      }
      setActionsReq(req)
    })()
  }, [api, connected, dpoInfo])

  // Separating from useEffect above because we don't want to make queries every block change
  useEffect(() => {
    if (!lastBlock || !dpoInfo || !actionsReq) return
    // If DPOInfo, just need dpoInfo, else need all keys in travelCabinKeys
    const allActions = getDpoActions({
      dpoInfo,
      selectedState,
      lastBlock,
      ...actionsReq,
    })
    setDpoActions(allActions)
  }, [lastBlock, actionsReq, dpoInfo, selectedState])

  return {
    dpoActions,
    targetTravelCabin: actionsReq?.targetTravelCabin,
    targetTravelCabinBuyer: actionsReq?.targetTravelCabinBuyer,
    targetDpo: actionsReq?.targetDpo,
  }
}
