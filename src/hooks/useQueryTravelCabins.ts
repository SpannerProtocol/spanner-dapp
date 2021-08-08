import { useEffect, useState } from 'react'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInfo, TravelCabinInventoryIndex } from 'spanner-api/types'
import { useApi } from './useApi'

export function useTravelCabins(token?: string): [TravelCabinIndex, TravelCabinInfo][] {
  const { api, connected } = useApi()
  const [travelCabins, setTravelCabins] = useState<[TravelCabinIndex, TravelCabinInfo][]>([])

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabins
      .entries()
      .then((entries) => {
        const orderedCabins: [TravelCabinIndex, TravelCabinInfo][] = []
        entries.forEach((entry) => {
          if (entry[1].isSome) {
            const cabinIndex = entry[0].args[0]
            const cabinInfo = entry[1].unwrapOrDefault()
            if (token) {
              // Filtered for token
              if (cabinInfo.token_id.asToken.eq(token)) {
                orderedCabins.push([cabinIndex, cabinInfo])
              }
            } else {
              // No token, just return all
              orderedCabins.push([cabinIndex, cabinInfo])
            }
          }
        })
        setTravelCabins(orderedCabins)
      })
      .catch((err) => console.log(err))
  }, [api, connected, token])

  return travelCabins
}

export function useSubTravelCabin(travelCabinIndex?: number | string | TravelCabinIndex): TravelCabinInfo | undefined {
  const { api, connected } = useApi()
  const [travelCabinInfo, setTravelCabinInfo] = useState<TravelCabinInfo | undefined>()

  useEffect(() => {
    if (!connected || travelCabinIndex === undefined) return
    let unsub: () => void = () => undefined
    ;(async () => {
      unsub = await api.query.bulletTrain.travelCabins(travelCabinIndex, (result) => {
        if (result.isSome) setTravelCabinInfo(result.unwrap())
      })
    })()
    return () => unsub()
  }, [api, connected, travelCabinIndex])

  return travelCabinInfo
}

export function useSubTravelCabinCount(): TravelCabinIndex | undefined {
  const { api, connected } = useApi()
  const [travelCabinCount, setTravelCabinCount] = useState<TravelCabinIndex>()

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabinCount((result) => {
      setTravelCabinCount(result)
    })
  }, [api, connected])

  return travelCabinCount
}

export function useSubTravelCabinBuyer(
  travelCabinIndex?: number | string | TravelCabinIndex,
  travelCabinInventoryIndex?: number | string | TravelCabinInventoryIndex
) {
  const { api, connected } = useApi()
  const [buyerInfo, setBuyerInfo] = useState<TravelCabinBuyerInfo>()

  useEffect(() => {
    if (!connected || !travelCabinIndex || !travelCabinInventoryIndex) return
    api.query.bulletTrain.travelCabinBuyer(travelCabinIndex, travelCabinInventoryIndex, (result) => {
      if (result.isSome) {
        setBuyerInfo(result.unwrapOrDefault())
      }
    })
  }, [api, connected, travelCabinIndex, travelCabinInventoryIndex])

  return buyerInfo
}

export function useSubTravelCabinBuyerVerbose(
  travelCabinIndex?: number | string | TravelCabinIndex,
  travelCabinInventoryIndex?: number | string | TravelCabinInventoryIndex
) {
  const { api, connected } = useApi()
  const [buyerInfo, setBuyerInfo] = useState<[[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]>()

  useEffect(() => {
    if (!connected || !travelCabinIndex || !travelCabinInventoryIndex) return
    api.query.bulletTrain.travelCabinBuyer(travelCabinIndex, travelCabinInventoryIndex, (result) => {
      if (result.isSome) {
        setBuyerInfo([
          [
            api.createType('TravelCabinIndex', travelCabinIndex),
            api.createType('TravelCabinInventoryIndex', travelCabinInventoryIndex),
          ],
          result.unwrapOrDefault(),
        ])
      }
    })
  }, [api, connected, travelCabinIndex, travelCabinInventoryIndex])

  return buyerInfo
}

/**
 * Get the TravelCabinInventoryIndex from the TravelCabinBuyer storage for a dpo
 * @param dpoIndex current dpo's index
 * @param travelCabinIndex index of travelcabin that current dpo is targeting
 * @returns TravelCabinInventoryIndex | undefined
 */
export function useDpoTravelCabinInventoryIndex(
  dpoIndex: string,
  travelCabinIndex?: TravelCabinIndex | number | string
) {
  const { api, connected } = useApi()
  const [inventoryIndex, setInventoryIndex] = useState<TravelCabinInventoryIndex>()

  useEffect(() => {
    if (!connected || !travelCabinIndex || !dpoIndex) return
    api.query.bulletTrain.travelCabinBuyer.entries(travelCabinIndex).then((result) => {
      const found = result.find(
        (buyerInfo) =>
          buyerInfo[1].isSome &&
          buyerInfo[1].unwrapOrDefault().buyer.isDpo &&
          buyerInfo[1].unwrapOrDefault().buyer.asDpo.eq(dpoIndex)
      )
      if (found) {
        setInventoryIndex(found[0].args[1])
      }
    })
  }, [api, connected, travelCabinIndex, dpoIndex])

  return inventoryIndex
}

/**
 * Convenience function to check if DPO has purchased the cabin
 * @param dpoIndex current dpo's index
 * @param travelCabinIndex index of travelcabin that current dpo is targeting
 * @returns boolean
 */
export function useDpoPurchasedCabin(dpoIndex: string, travelCabinIndex?: TravelCabinIndex | number | string) {
  const inventoryIndex = useDpoTravelCabinInventoryIndex(dpoIndex, travelCabinIndex)
  return inventoryIndex ? true : false
}

/**
 * Get an array of all TravelCabin
 * @param travelCabinIndex Index of TravelCabin
 */
export function useTravelCabinBuyers(travelCabinIndex: number | string | TravelCabinIndex) {
  const { api, connected } = useApi()
  const [buyers, setBuyers] = useState<[[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo][]>([])

  useEffect(() => {
    if (!connected || !travelCabinIndex) return
    api.query.bulletTrain.travelCabinBuyer.entries(travelCabinIndex).then((entries) => {
      entries.forEach((entry) => {
        if (entry[1].isSome) {
          setBuyers((prev) => [...prev, [entry[0].args, entry[1].unwrapOrDefault()]])
        }
      })
    })
  }, [api, connected, travelCabinIndex])

  return buyers
}

export function useSubTravelCabinInventory(
  travelCabinIndex: TravelCabinIndex | number | string | undefined
): [TravelCabinInventoryIndex, TravelCabinInventoryIndex] | undefined {
  const { api } = useApi()
  const [inventoryCounts, setInventoryCounts] = useState<[TravelCabinInventoryIndex, TravelCabinInventoryIndex]>()

  useEffect(() => {
    if (!api || !travelCabinIndex) return
    api?.query?.bulletTrain.travelCabinInventory(travelCabinIndex, (result) => {
      setInventoryCounts(result.unwrapOrDefault())
    })
  }, [api, travelCabinIndex])

  return inventoryCounts
}
