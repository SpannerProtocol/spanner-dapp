import { ApiPromise } from '@polkadot/api'
import { postScanExtrinsics, SpanfuraExtrinsicsResponse } from 'spanfura'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces/types'
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
  const travelCabinInventoryPromise = postScanExtrinsics({
    row: 100,
    page: 0,
    module: 'bullettrain',
    call: 'dpo_buy_travelcabin',
    success: 'true',
  }).then((response: SpanfuraExtrinsicsResponse) => {
    if (!response.data.extrinsics) {
      // Add global error
      return
    }
    const targetTravelCabinData: TravelCabinData = {}
    response.data.extrinsics.forEach((extrinsic) => {
      extrinsic.params_json.forEach((param) => {
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
