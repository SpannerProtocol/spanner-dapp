import { ApiPromise } from '@polkadot/api'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'

export function getTravelCabinBuyer(api: ApiPromise) {
  return api.query.bulletTrain.travelCabinBuyer.entries()
}

/**
 * Get all TravelCabinInventoryIndexes for each TravelCabinIndex.
 * This function is intended to return the index for subscriptions.
 * @param api ApiPromise
 * @param cabinIndex TravelCabinIndex
 * @param address Spanner Address
 * @returns Array of TravelCabinInventoryIndexes
 */
export async function getUserCabinInventoryIndexes(
  api: ApiPromise,
  cabinIndex: string | TravelCabinIndex | number,
  address: string
) {
  const buyers = await api.query.bulletTrain.travelCabinBuyer.entries(cabinIndex)
  const userInventoryIndexes: [TravelCabinIndex, TravelCabinInventoryIndex][] = []
  buyers.forEach((buyer) => {
    if (buyer[1].isSome) {
      const buyerInfo = buyer[1].unwrapOrDefault()
      if (buyerInfo.buyer.isPassenger) {
        const travelCabinIndex = api.createType('TravelCabinIndex', cabinIndex)
        buyerInfo.buyer.asPassenger.eq(address) && userInventoryIndexes.push([travelCabinIndex, buyer[0].args[1]])
      }
    }
  })
  return userInventoryIndexes
}

export async function getDpoCabinInventoryIndex(api: ApiPromise, dpoInfo: DpoInfo) {
  if (!dpoInfo.target.isTravelCabin) return
  const buyers = await api.query.bulletTrain.travelCabinBuyer.entries(dpoInfo.target.asTravelCabin.toString())

  const found = buyers.find((buyer) => {
    if (buyer[1].isNone) return false
    const buyerInfo = buyer[1].unwrapOrDefault()
    if (buyerInfo.buyer.isDpo) {
      if (buyerInfo.buyer.asDpo.eq(dpoInfo.index.toString())) {
        return true
      }
    }
    return false
  })
  if (found) {
    return found[0].args
  }
  return undefined
}
