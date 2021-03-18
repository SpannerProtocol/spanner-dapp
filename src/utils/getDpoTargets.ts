import { ApiPromise } from '@polkadot/api'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces/types'
import { postScanEvents, SpanfuraEventsSchema } from 'spanfura'
import { WalletInfo } from './getWalletInfo'

export interface TravelCabinData {
  index?: TravelCabinIndex
  inventoryIndex?: TravelCabinInventoryIndex
}
// getDpoTarget
export function getTargetDpo(api: ApiPromise, dpoInfo: DpoInfo) {
  // Get data for parent DPO or TravelCabin
  return api.query.bulletTrain.dpos(dpoInfo.target.asDpo[0].toString())
}

export function getTargetTravelCabin(api: ApiPromise, wallet: WalletInfo, dpoInfo: DpoInfo) {
  const travelCabinInfoPromise = api.query.bulletTrain
    .travelCabins(dpoInfo.target.asTravelCabin.toString())
    .then((result) => result.unwrapOrDefault())
  // Get the TravelCabinInventoryIndex
  const travelCabinInventoryPromise = postScanEvents({
    row: 100,
    page: 0,
    module: 'bulletTrain',
    call: 'DpoBuyTravelCabin',
    address: wallet.address,
    success: 'true',
  }).then((response) => {
    const eventsData: SpanfuraEventsSchema = response.data
    if (!eventsData.data.events) {
      // Add global error
      return
    }
    const paramsJson = eventsData.data.events.map((events) => events.params_json)
    const targetTravelCabinData: TravelCabinData = {}
    paramsJson.forEach((paramSet) => {
      paramSet.forEach((param) => {
        if (param.type === 'TravelCabinIndex' && param.value === dpoInfo.target.asTravelCabin.toNumber()) {
          targetTravelCabinData.index = param.value
        }
        if (param.type === 'TravelCabinInventoryIndex') {
          targetTravelCabinData.inventoryIndex = param.value
        }
      })
    })
    return targetTravelCabinData
  })
  return Promise.all([travelCabinInfoPromise, travelCabinInventoryPromise])
}
