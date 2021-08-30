import type { BlockNumber } from 'spanner-api/types'
import { useEffect, useMemo, useState } from 'react'
import {
  DpoInfo,
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'spanner-api/types'
import getDpoActions, { DpoAction } from 'utils/getDpoActions'
import { getTargetTravelCabin } from 'utils/getDpoTargets'
import { getDpoTargetCabinBuyer } from 'utils/getTravelCabinBuyer'
import { useApi } from './useApi'
import { useBlockManager } from './useBlocks'

interface DpoActionParams {
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
  const [actionsReq, setActionsReq] = useState<DpoActionParams>()
  const [dpoActions, setDpoActions] = useState<DpoAction[]>()

  // Target Cabin needed to parse actions centrally
  useEffect(() => {
    if (!connected || !dpoInfo) return
    ;(async () => {
      const req: DpoActionParams = {}
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

  return dpoActions
}

/**
 * Get all actions for the current state filtered for conditions
 * @param dpoInfo
 * @returns
 */
export function useDpoCurrentStateActions(dpoInfo?: DpoInfo) {
  const dpoActions = useDpoActions(dpoInfo, dpoInfo ? dpoInfo.state.toString() : 'CREATED')

  const filteredActions = useMemo(() => {
    if (!dpoActions || !dpoInfo) return []
    const filteredDpoActions: DpoAction[] = []
    dpoActions.forEach((dpoAction) => {
      if (dpoAction.action === 'releaseFareFromDpo') {
        if (!dpoInfo.vault_withdraw.isZero()) filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'withdrawFareFromTravelCabin') {
        filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'dpoBuyTravelCabin') {
        // If not available, user needs to set a new target
        filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'dpoBuyDpoSeats') {
        if (!dpoInfo.target.isDpo) return
        // If not available, user needs to enter index of cabin that is
        filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'withdrawYieldFromTravelCabin') {
        if (!dpoInfo.target.isTravelCabin) return
        filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'releaseYieldFromDpo') {
        if (!dpoInfo.vault_yield.isZero()) filteredDpoActions.push(dpoAction)
      } else if (dpoAction.action === 'releaseBonusFromDpo') {
        if (!dpoInfo.vault_bonus.isZero()) filteredDpoActions.push(dpoAction)
      }
    })
    return filteredDpoActions
  }, [dpoActions, dpoInfo])

  return filteredActions
}
