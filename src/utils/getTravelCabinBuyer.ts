import { ApiPromise } from '@polkadot/api'

export function getTravelCabinBuyer(api: ApiPromise) {
  return api.query.bulletTrain.travelCabinBuyer.entries()
}
