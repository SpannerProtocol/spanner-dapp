import { BlockNumber } from '@polkadot/types/interfaces'
import BN from 'bn.js'
import {
  DpoIndex,
  DpoInfo,
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'spanner-interfaces'
import { WalletInfo } from './getWalletInfo'

export interface DpoAction {
  action: string
  dpoIndex: number | string | DpoIndex
}

interface GetDpoActionsParams {
  dpoInfo: DpoInfo
  isMember: boolean
  lastBlock: BlockNumber
  selectedState?: string
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetTravelCabinInventory?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
  targetTravelCabinInventoryIndex?: TravelCabinInventoryIndex
  targetDpo?: DpoInfo
  dpoIsMemberOfTargetDpo?: boolean
  walletInfo: WalletInfo
}

function actionParser({
  dpoInfo,
  dpoState,
  dpoStateType,
  lastBlock,
  targetTravelCabin,
  targetTravelCabinBuyer,
}: {
  dpoInfo: DpoInfo
  dpoState: string
  dpoStateType: string
  isMember: boolean
  lastBlock: BlockNumber
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetTravelCabinInventory?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
  targetTravelCabinInventoryIndex?: TravelCabinInventoryIndex
  targetDpo?: DpoInfo
  dpoIsMemberOfTargetDpo?: boolean
  walletInfo: WalletInfo
}) {
  const actions: Array<DpoAction> = []

  if (dpoState === 'CREATED') {
    // If expired then anyone can withdraw from target [Verified]
    if (lastBlock.gte(dpoInfo.expiry_blk)) {
      if (!dpoInfo.vault_deposit.isZero()) {
        actions.push({ action: 'releaseFareFromDpo', dpoIndex: dpoInfo.index })
      }
    }

    if (dpoStateType === 'selected' && dpoInfo.state.isFailed) {
      if (!dpoInfo.vault_deposit.isZero()) {
        actions.push({
          action: 'releaseFareFromDpo',
          dpoIndex: dpoInfo.index,
        })
      }
    }
  }

  if (dpoState === 'ACTIVE') {
    if (dpoInfo.target.isTravelCabin) {
      // Buy TravelCabin
      actions.push({
        action: 'dpoBuyTravelCabin',
        dpoIndex: dpoInfo.index,
      })
    }
    // If there is a bonus while state is active, then DPO has been successfully purchased
    // Once bonus is released, state = RUNNING
    if (!dpoInfo.vault_bonus.isZero()) {
      actions.push({
        action: 'releaseBonusFromDpo',
        dpoIndex: dpoInfo.index,
      })
    }
    // Buy DPO Seats
    if (dpoInfo.target.isDpo) {
      actions.push({
        action: 'dpoBuyDpoSeats',
        dpoIndex: dpoInfo.index,
      })
    }
  }

  // At Committed state, manager or user has to release rewards
  if (dpoState === 'RUNNING') {
    // Release bonus
    actions.push({
      action: 'releaseBonusFromDpo',
      dpoIndex: dpoInfo.index,
    })

    // Within grace period
    actions.push({
      action: 'releaseYieldFromDpo',
      dpoIndex: dpoInfo.index,
    })

    // Can withdraw whenever they want
    if (dpoInfo.target.isTravelCabin) {
      if (targetTravelCabinBuyer && targetTravelCabin) {
        // If there is still any yield left to withdraw
        if (!targetTravelCabinBuyer[1].yield_withdrawn.eq(targetTravelCabin.yield_total)) {
          actions.push({
            action: 'withdrawYieldFromTravelCabin',
            dpoIndex: dpoInfo.index,
          })
        } else {
          // If there is no more yield to withdraw, trip is over, can withdraw Fare
          // Also only show the action when all yields and bonuses have been released.
          if (dpoInfo.vault_yield.isZero() && dpoInfo.vault_bonus.isZero()) {
            actions.push({
              action: 'withdrawFareFromTravelCabin',
              dpoIndex: dpoInfo.index,
            })
          }
        }
      }
    }
  }

  if (dpoState === 'COMPLETED') {
    if (dpoInfo.fare_withdrawn.isFalse) {
      actions.push({
        action: 'releaseFareFromDpo',
        dpoIndex: dpoInfo.index,
      })
    }
  }

  if (dpoStateType === 'dpoInfo' && dpoInfo.state.isFailed) {
    actions.push({
      action: 'releaseFareFromDpo',
      dpoIndex: dpoInfo.index,
    })
  }

  return actions
}

/**
 * Get all actions for a DPO.
 * Since non-DPO members can also perform actions on behalf of a DPO, actions are generated generally
 * while alerts are catered towards user types.
 * Rules are as follows:
 * CREATE
 * - If expired, any user can withdraw from target DPO or travelCabin
 * FILLED
 * - If expired, any user can withdraw from target DPO or travelCabin
 * - Anyone can commit but Manager has until grace period to commit otherwise his fee gets slashed
 * COMMITTED
 * - Someone needs to help the Lead DPO withdraw from the travelCabin to activate rewards
 * - Whenever there is money in the DPO vault, someone can withdraw from it
 * - If manager does not release rewards within grace period his fee will get slashed
 * COMPLETED
 * - Someone needs to withdarw from the target
 */
export default function getDpoActions(props: GetDpoActionsParams): Array<DpoAction> | undefined {
  const { selectedState, dpoInfo } = props
  if (selectedState) {
    return actionParser({ ...props, dpoState: selectedState, dpoStateType: 'selected' })
  } else {
    return actionParser({ ...props, dpoState: dpoInfo.state.toString(), dpoStateType: 'dpoinfo' })
  }
}

/**
 * Get an alert for the DPO based on user type. Alerts are intended to be used
 * in Portfolio because on the DPO page the action is available for all users.
 * Since most actions, any user can perform it but there they are incentivized not to,
 * the alerts will prioritize alerting users based on:
 * - Manager in grace period
 * - Both Manager and Members outside grace period
 */
export function getDpoAlerts(params: GetDpoActionsParams) {
  const { walletInfo, dpoInfo } = params
  const actions = getDpoActions(params)

  // If user is not logged in
  if (!walletInfo.address) return
  if (!actions) return

  const userIsManager = walletInfo.address === dpoInfo.manager.toString()

  // Filter actions that require user attention
  const filteredActions = actions?.map((action) => {
    // Release periodic drop is special because once state === COMMITTED this action is always available
    if (action.action === 'releaseFareFromDpo') {
      // If there's nothing in the periodic drop vault then return nothing
      if (dpoInfo.vault_yield.toBn().eq(new BN(0))) return
      if (userIsManager) {
        // This action always has grace period
        return action
      }
    }

    // If user is manager
    if (userIsManager) {
      return action
    }
  })
  return filteredActions
}
