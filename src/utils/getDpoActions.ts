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
import { DPO_COMMIT_GRACE_BLOCKS, DPO_RELEASE_DROP_GRACE_BLOCKS } from '../constants'
import { WalletInfo } from './getWalletInfo'

export interface DpoAction {
  role: 'manager' | 'member' | 'any'
  action: string
  conflict?: string
  hasGracePeriod: boolean
  inGracePeriod?: boolean
  dpoIndex: number | string | DpoIndex
}

interface GetDpoActionsParams {
  dpoInfo: DpoInfo
  lastBlock: BlockNumber
  targetTravelCabin?: TravelCabinInfo
  targetTravelCabinBuyer?: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  targetTravelCabinInventory?: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]
  targetDpo?: DpoInfo
  walletInfo: WalletInfo
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
export default function getDpoActions(params: GetDpoActionsParams): Array<DpoAction> | undefined {
  const { dpoInfo, lastBlock, targetTravelCabin, targetTravelCabinInventory, targetDpo } = params

  // const userIsManager = walletInfo.address === manager.buyer.asIndividual.toString()

  const actions: Array<DpoAction> = []

  if (dpoInfo.state.toString() === 'CREATED') {
    // If expired then anyone can withdraw from target [Verified]
    if (lastBlock.gte(dpoInfo.expiry_blk)) {
      if (dpoInfo.target.isDpo) {
        actions.push({ role: 'any', hasGracePeriod: false, action: 'releaseFareFromDpo', dpoIndex: dpoInfo.index })
      }
      if (dpoInfo.target.isTravelCabin) {
        actions.push({
          role: 'any',
          hasGracePeriod: false,
          action: 'withdrawFareFromTravelCabin',
          dpoIndex: dpoInfo.index,
        })
      }
    }
  }

  if (dpoInfo.state.toString() === 'ACTIVE') {
    // Filled but expired, withdraw from target [Verified]
    if (lastBlock.gte(dpoInfo.expiry_blk)) {
      if (dpoInfo.target.isDpo) {
        actions.push({ role: 'any', hasGracePeriod: false, action: 'releaseFareFromDpo', dpoIndex: dpoInfo.index })
      }
      if (dpoInfo.target.isTravelCabin) {
        actions.push({
          role: 'any',
          hasGracePeriod: false,
          action: 'withdrawFareFromTravelCabin',
          dpoIndex: dpoInfo.index,
        })
      }
    }
    // If not expired, DPO needs to purchase target
    if (lastBlock.lt(dpoInfo.expiry_blk)) {
      const blockFilled = dpoInfo.blk_of_dpo_filled.unwrapOrDefault()
      const gracePeriodEnd = blockFilled.toBn().add(new BN(DPO_COMMIT_GRACE_BLOCKS))

      if (dpoInfo.target.isTravelCabin) {
        // Buy TravelCabin
        if (!targetTravelCabin || !targetTravelCabinInventory) return
        // Check if there is available supply. If full then user needs to select another TravelCabin.
        if (targetTravelCabinInventory[0] === targetTravelCabinInventory[1]) {
          // Within Grace Period
          if (lastBlock.toBn().lte(gracePeriodEnd)) {
            actions.push({
              role: 'any',
              hasGracePeriod: true,
              inGracePeriod: true,
              action: 'dpoBuyTravelCabin',
              dpoIndex: dpoInfo.index,
              conflict: 'targetTravelCabinHasNoSupply',
            })
          } else {
            actions.push({
              role: 'any',
              hasGracePeriod: true,
              inGracePeriod: false,
              action: 'dpoBuyTravelCabin',
              dpoIndex: dpoInfo.index,
              conflict: 'targetTravelCabinHasNoSupply',
            })
          }
        } else {
          if (dpoInfo.vault_bonus.isZero()) {
            // Within Grace Period
            if (lastBlock.lte(gracePeriodEnd)) {
              // If purchased there will be bonus instantly released to their vault
              actions.push({
                role: 'any',
                hasGracePeriod: true,
                inGracePeriod: true,
                action: 'dpoBuyTravelCabin',
                dpoIndex: dpoInfo.index,
              })
            } else {
              actions.push({
                role: 'any',
                hasGracePeriod: true,
                inGracePeriod: false,
                action: 'dpoBuyTravelCabin',
                dpoIndex: dpoInfo.index,
              })
            }
          }
        }
        // If there is a bonus while state is active, then DPO has been successfully purchased
        // Once bonus is released, state = RUNNING
        if (!dpoInfo.vault_bonus.isZero()) {
          actions.push({
            role: 'any',
            hasGracePeriod: false,
            action: 'releaseBonusFromDpo',
            dpoIndex: dpoInfo.index,
          })
        }
      }
      // Buy DPO Seats
      if (dpoInfo.target.isDpo) {
        if (!targetDpo) return
        const targetSeats = dpoInfo.target.asDpo[1]

        // User needs to choose a new DPO if there aren't enough seats available. [Verified]
        if (targetSeats.lt(targetDpo.empty_seats)) {
          // Within Grace Period
          if (lastBlock.lt(gracePeriodEnd)) {
            actions.push({
              role: 'any',
              hasGracePeriod: true,
              inGracePeriod: true,
              action: 'dpoBuyDpoSeats',
              dpoIndex: dpoInfo.index,
              conflict: 'targetDpoInsufficientSeats',
            })
          } else {
            actions.push({
              role: 'any',
              hasGracePeriod: true,
              inGracePeriod: false,
              action: 'dpoBuyDpoSeats',
              dpoIndex: dpoInfo.index,
              conflict: 'targetDpoInsufficientSeats',
            })
          }
        } else {
          // Within Grace Period
          if (dpoInfo.vault_bonus.isZero()) {
            if (dpoInfo.vault_bonus.isZero()) {
              actions.push({
                role: 'any',
                hasGracePeriod: true,
                inGracePeriod: true,
                action: 'dpoBuyDpoSeats',
                dpoIndex: dpoInfo.index,
              })
            } else {
              actions.push({
                role: 'any',
                hasGracePeriod: true,
                inGracePeriod: false,
                action: 'dpoBuyDpoSeats',
                dpoIndex: dpoInfo.index,
              })
            }
          }
        }
      }
    }
  }

  // At Committed state, manager or user has to release rewards [Verified]
  if (dpoInfo.state.toString() === 'RUNNING') {
    // Can withdraw whenever they want
    actions.push({
      role: 'any',
      hasGracePeriod: false,
      action: 'withdrawYieldFromTravelCabin',
      dpoIndex: dpoInfo.index,
    })

    if (!dpoInfo.vault_bonus.isZero()) {
      actions.push({
        role: 'any',
        hasGracePeriod: false,
        action: 'releaseBonusFromDpo',
        dpoIndex: dpoInfo.index,
      })
    }

    const dropGracePeriod = dpoInfo.blk_of_last_yield
      .unwrapOrDefault()
      .toBn()
      .add(new BN(DPO_RELEASE_DROP_GRACE_BLOCKS))

    // Within grace period
    if (!dpoInfo.vault_yield.isZero()) {
      if (lastBlock.lt(dropGracePeriod)) {
        actions.push({
          role: 'any',
          hasGracePeriod: true,
          inGracePeriod: true,
          action: 'releaseYieldFromDpo',
          dpoIndex: dpoInfo.index,
        })
      } else {
        actions.push({
          role: 'any',
          hasGracePeriod: true,
          inGracePeriod: false,
          action: 'releaseYieldFromDpo',
          dpoIndex: dpoInfo.index,
        })
      }
    }
  }

  if (dpoInfo.state.toString() === 'COMPLETED') {
    if (dpoInfo.target.isTravelCabin) {
      actions.push({
        role: 'any',
        hasGracePeriod: false,
        action: 'withdrawFareFromTravelCabin',
        dpoIndex: dpoInfo.index,
      })
    }
    if (dpoInfo.target.isDpo) {
      actions.push({
        role: 'any',
        hasGracePeriod: false,
        action: 'releaseFareFromDpo',
        dpoIndex: dpoInfo.index,
      })
    }
  }

  if (dpoInfo.state.toString() === 'FAILED') {
    if (dpoInfo.target.isTravelCabin) {
      actions.push({
        role: 'any',
        hasGracePeriod: false,
        action: 'withdrawFareFromTravelCabin',
        dpoIndex: dpoInfo.index,
      })
    }
    if (dpoInfo.target.isDpo) {
      actions.push({
        role: 'any',
        hasGracePeriod: false,
        action: 'releaseFareFromDpo',
        dpoIndex: dpoInfo.index,
      })
    }
  }
  return actions
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
    if (action.action === 'releaseFareFromDpo' && action.role === 'manager') {
      // If there's nothing in the periodic drop vault then return nothing
      if (dpoInfo.vault_yield.toBn().eq(new BN(0))) return
      if (userIsManager) {
        // This action always has grace period
        if (action.inGracePeriod) {
          return action
        }
      }
    }
    if (action.action === 'releaseFareFromDpo' && action.role === 'member') {
      if (dpoInfo.vault_yield.toBn().eq(new BN(0))) return
      if (!userIsManager) {
        if (!action.inGracePeriod) {
          return action
        }
      }
    }

    // If user is manager
    if (userIsManager) {
      if (action.hasGracePeriod) {
        if (action.inGracePeriod) {
          return action
        }
      } else {
        return action
      }
    } else {
      if (action.hasGracePeriod) {
        if (action.inGracePeriod) {
          return action
        }
      }
    }
  })
  return filteredActions
}
