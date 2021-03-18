import { StorageKey } from '@polkadot/types'
import { useEffect, useState } from 'react'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInfo, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { useApi } from './useApi'

export function useQueryTravelCabinsWithKeys(token?: string): Array<[StorageKey, TravelCabinInfo]> {
  const { api } = useApi()
  const [travelCabinEntries, setTravelCabinEntries] = useState<Array<[StorageKey, TravelCabinInfo]>>([])

  useEffect(() => {
    if (!api) return
    api?.query?.bulletTrain.travelCabins
      .entries()
      .then((entries) => {
        const unwrapped: Array<[StorageKey, TravelCabinInfo]> = entries.map((entry) => {
          return [entry[0], entry[1].unwrapOrDefault()]
        })
        let filtered = unwrapped
        if (token) {
          filtered = unwrapped.filter((entry) => entry[1].token_id.eq({ Token: token }))
        }
        setTravelCabinEntries(filtered)
      })
      .catch((err) => console.log(err))
  }, [api, token])

  return travelCabinEntries
}

export function useQueryTravelCabins(): Array<TravelCabinInfo> {
  const travelCabinEntries = useQueryTravelCabinsWithKeys()
  const [travelCabins, setTravelCabins] = useState<Array<TravelCabinInfo>>([])

  useEffect(() => {
    if (!travelCabinEntries || travelCabinEntries.length === 0) return
    const unwrappedTravelCabins = travelCabinEntries.map((entry) => entry[1])
    setTravelCabins(unwrappedTravelCabins)
  }, [travelCabinEntries])

  return travelCabins
}

export function useSubTravelCabin(travelCabinIndex?: number | string): TravelCabinInfo | undefined {
  const { api } = useApi()
  const [travelCabinInfo, setTravelCabinInfo] = useState<TravelCabinInfo | undefined>()

  useEffect(() => {
    if (!api || !travelCabinIndex) return
    api?.query?.bulletTrain.travelCabins(travelCabinIndex, (result) => {
      if (result.isNone) {
        setTravelCabinInfo(undefined)
      } else {
        setTravelCabinInfo(result.unwrap())
      }
    })
  }, [api, travelCabinIndex])

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
/**
 * Get the travel cabin buyer
 * @param travelCabinIndex
 * @param travelCabinInventoryIndex
 */
export function useSubTravelCabinBuyer(
  travelCabinIndex: TravelCabinIndex | number | string,
  travelCabinInventoryIndex: TravelCabinInventoryIndex | number | string | null
): TravelCabinBuyerInfo | undefined {
  const { api, connected } = useApi()
  const [inventory, setInventory] = useState<TravelCabinBuyerInfo>()

  useEffect(() => {
    if (!connected || !travelCabinInventoryIndex) return
    api.query.bulletTrain.travelCabinBuyer(travelCabinIndex, travelCabinInventoryIndex, (result) => {
      setInventory(result.unwrapOrDefault())
    })
  }, [api, connected, travelCabinIndex, travelCabinInventoryIndex])

  return inventory
}

export function useGetTravelCabinInventoryIndex(
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

export function useRpcUserTravelCabins(address: string | null | undefined) {
  const { api, connected } = useApi()
  const [indexes, setIndexes] = useState<Array<[TravelCabinIndex, TravelCabinInventoryIndex]>>([])
  const [travelCabins, setTravelCabins] = useState<Array<[TravelCabinIndex, TravelCabinInfo]>>([])

  useEffect(() => {
    if (!connected || !address) return
    api.rpc.bulletTrain
      .getTravelCabinsOfAccount(address)
      .then((result) => setIndexes(result))
      .catch((err) => console.log(err))
  }, [api, address, connected])

  useEffect(() => {
    if (!indexes) return
    const travelCabinPromises = indexes.map<Promise<[TravelCabinIndex, TravelCabinInfo]>>(async (index) => [
      index[0],
      await api.query.bulletTrain.travelCabins(index[0]).then((result) => result.unwrapOrDefault()),
    ])
    Promise.all(travelCabinPromises).then((result) => setTravelCabins(result))
  }, [api, indexes])

  return travelCabins
}
