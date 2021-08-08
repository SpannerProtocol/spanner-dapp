import { ApiPromise } from '@polkadot/api'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-api/types'

export interface TravelCabinData {
  index?: TravelCabinIndex
  inventoryIndex?: TravelCabinInventoryIndex
}
// getDpoTarget
export function getTargetDpo(api: ApiPromise, dpoInfo: DpoInfo) {
  // Get data for parent DPO or TravelCabin
  return api.query.bulletTrain.dpos(dpoInfo.target.asDpo[0].toString())
}

export function getTargetTravelCabin(api: ApiPromise, dpoInfo: DpoInfo) {
  return api.query.bulletTrain.travelCabins(dpoInfo.target.asTravelCabin.toString())
}
