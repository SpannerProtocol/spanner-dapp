import { ApiPromise } from '@polkadot/api'
import { TravelCabinIndex } from 'spanner-interfaces/types'

export default function getTravelCabinInventory(api: ApiPromise, travelCabinIndex: TravelCabinIndex) {
  return api.query.bulletTrain.travelCabinInventory(travelCabinIndex)
}
