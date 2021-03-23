import { BlockNumber } from '@polkadot/types/interfaces'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInfo } from 'spanner-interfaces'
import { WalletInfo } from './getWalletInfo'

export interface UserAction {
  action: string
  travelCabinIndex: number | string | TravelCabinIndex
}

interface GetUserActionsParams {
  travelCabinIndex: TravelCabinIndex | string | number
  travelCabinInfo: TravelCabinInfo
  travelCabinBuyerInfo: TravelCabinBuyerInfo
  lastBlock: BlockNumber
  walletInfo: WalletInfo
}

/**
 * Get all User's actions to be performed on the TravelCabin page.
 * @param travelCabinIndex Index of travelCabin
 * @param travelCabinInfo TravelCabinInfo
 * @param travelCabinBuyerInfo TravelCabinBuyerInfo
 * @param lastBlock the last block processed
 * @param walletInfo WalletInfo
 */
export default function getUserActions({
  travelCabinIndex,
  travelCabinInfo,
  travelCabinBuyerInfo,
  lastBlock,
  walletInfo,
}: GetUserActionsParams): Array<UserAction> | undefined {
  const actions: Array<UserAction> = []

  // User must be logged in
  if (!walletInfo || !walletInfo.address) return
  // User must be passenger type
  if (!travelCabinBuyerInfo.buyer.isPassenger) return
  // User must be buyer
  if (!travelCabinBuyerInfo.buyer.asPassenger.eq(walletInfo.address)) return

  // Users can start withdrawing yield immediately upon purchase
  // A check that there's something to withdraw
  if (travelCabinBuyerInfo.yield_withdrawn.lt(travelCabinInfo.yield_total)) {
    actions.push({
      action: 'withdrawYieldFromTravelCabin',
      travelCabinIndex,
    })
  }

  // On maturity, user can withdraw their deposit
  if (travelCabinInfo.maturity.eq(lastBlock) && !travelCabinBuyerInfo.fare_withdrawn) {
    actions.push({
      action: 'withdrawFareFromTravelCabin',
      travelCabinIndex,
    })
  }

  return actions
}

/**
 * Same as getUserActions. Placeholder for alert refactor.
 * Planning to add style information + icons here.
 * @param travelCabinIndex Index of travelCabin
 * @param travelCabinInfo TravelCabinInfo
 * @param travelCabinBuyerInfo TravelCabinBuyerInfo
 * @param lastBlock the last block processed
 * @param walletInfo WalletInfo
 */
export function getUserAlerts(params: GetUserActionsParams) {
  const actions = getUserActions(params)
  return actions
}
