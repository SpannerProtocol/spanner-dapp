import { ApiPromise } from '@polkadot/api'
import { DpoIndex } from 'spanner-api/types'

export function getDpoMembers(api: ApiPromise, dpoIndex: DpoIndex) {
  // Get data for parent DPO or TravelCabin
  return api.query.bulletTrain.dpoMembers.entries(dpoIndex)
}
