import { ApiPromise } from '@polkadot/api'
import { TravelCabinIndex, TravelCabinInventoryIndex } from 'interfaces/bulletTrain'

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
