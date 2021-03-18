import { DpoInfo, TravelCabinInventoryIndex } from 'spanner-interfaces'

/**
 * Check if Target DPO is available for purchase
 * @param dpoInfo Current DPO
 * @param targetDpo The Target DPO
 */
export function isDpoAvailable(dpoInfo: DpoInfo, targetDpo: DpoInfo) {
  return targetDpo.empty_seats.gte(dpoInfo.target.asDpo[1])
}

/**
 * Check if TravelCabin is available for purchase
 * @param inventory The stock from travelCabinInventory
 */
export function isTravelCabinAvailable(inventory: [TravelCabinInventoryIndex, TravelCabinInventoryIndex]) {
  return inventory[0].toBn().lt(inventory[1].toBn())
}
