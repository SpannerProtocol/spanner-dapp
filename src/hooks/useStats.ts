import { StorageKey } from '@polkadot/types'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { DpoIndex, TravelCabinIndex } from 'spanner-interfaces'
import { useApi } from './useApi'

export function useCabinKeys(token: string) {
  const { api, connected } = useApi()
  const [cabinKeys, setCabinKeys] = useState<TravelCabinIndex[]>([])

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabins.entries().then((entries) =>
      entries.forEach(([storageKey, cabinInfoOption]) => {
        if (cabinInfoOption.isSome) {
          const cabinInfo = cabinInfoOption.unwrapOrDefault()
          if (cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.eq(token.toUpperCase())) {
            setCabinKeys((prev) => [...prev, storageKey.args[0]])
          }
        }
      })
    )
  }, [connected, api, token])

  return cabinKeys
}

export function useTotalCabinsBought(cabinKeys: TravelCabinIndex[]) {
  const { api, connected } = useApi()
  const [cabinCount, setCabinCount] = useState<number>(0)

  const cabinKeysStr = useMemo(() => cabinKeys.map((key) => key.toString()), [cabinKeys])

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabinInventory.entries().then((entries) => {
      let count = 0
      entries.forEach((inventory) => {
        if (inventory[1].isSome && cabinKeysStr.includes(inventory[0].args[0].toString())) {
          count = count + inventory[1].unwrapOrDefault()[0].toNumber()
        }
      })
      setCabinCount(count)
    })
  }, [connected, api, cabinKeysStr])

  return cabinCount
}

export function useTotalPassengers(token: string) {
  const { api, connected } = useApi()
  const [passengerCount, setPassengerCount] = useState<number>(0)
  const [dpoKeys, setDpoKeys] = useState<StorageKey<[DpoIndex]>[]>([])

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.dpos.entries().then((entries) => {
      const keys: StorageKey<[DpoIndex]>[] = []
      entries.forEach(([storageKey, dpoInfoOption]) => {
        if (dpoInfoOption.isSome) {
          const dpoInfo = dpoInfoOption.unwrapOrDefault()
          if (dpoInfo.token_id.eq(token)) {
            keys.push(storageKey)
          }
        }
      })
      setDpoKeys(keys)
    })
  }, [connected, api, token])

  useEffect(() => {
    if (!connected || !dpoKeys) return
    dpoKeys.forEach((key) => {
      const dpoIndex = key.args[0]
      api.query.bulletTrain.dpoMembers.entries(dpoIndex).then((dpoMembersEntries) => {
        setPassengerCount((prev) => prev + dpoMembersEntries.length)
      })
    })
  }, [api, connected, dpoKeys])

  return passengerCount
}

export function useTotalYieldWithdrawn(cabinKeys: TravelCabinIndex[]) {
  const { api, connected } = useApi()
  const [yieldWithdrawn, setYieldWithdrawn] = useState<BN>(new BN(0))

  useEffect(() => {
    if (!connected || cabinKeys.length === 0) return
    const buyerPromises = cabinKeys.map((key) =>
      api.query.bulletTrain.travelCabinBuyer
        .entries(key)
        .then((entries) => entries.map((entry) => entry[1].unwrapOrDefault().yield_withdrawn.toBn()))
    )

    Promise.all(buyerPromises).then((result) => {
      let totalYield = new BN(0)
      result.forEach((yieldPerInventory) =>
        yieldPerInventory.forEach((y) => {
          totalYield = totalYield.add(y)
        })
      )
      setYieldWithdrawn(totalYield)
    })
  }, [api, connected, cabinKeys])

  return yieldWithdrawn.toString()
}

interface ValueObj {
  [index: string]: BN
}

export function useTotalValueLocked(cabinKeys: TravelCabinIndex[]) {
  const { api, connected } = useApi()
  const [totalValueLocked, setTotalValueLocked] = useState<BN>(new BN(0))
  const [valueObj, setValueObj] = useState<ValueObj>({})

  // Get the deposit amount for each travel cabin class
  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabins.entries().then((entries) => {
      entries.forEach((cabinInfo) => {
        if (cabinInfo[1].isSome) {
          setValueObj((prev) => ({
            [cabinInfo[1].unwrapOrDefault().index.toString()]: cabinInfo[1].unwrapOrDefault().deposit_amount.toBn(),
            ...prev,
          }))
        }
      })
    })
  }, [api, connected])

  // Calculate the total value locked from all unwithdrawn bought travel cabins
  useEffect(() => {
    if (!connected || cabinKeys.length === 0 || !valueObj) return
    if (!Object.keys(cabinKeys).every((k) => Object.keys(valueObj).includes(k))) return
    const tvlPromises = cabinKeys.map((key) =>
      api.query.bulletTrain.travelCabinBuyer.entries(key).then((buyerInfoEntries) =>
        buyerInfoEntries.map((buyer) => {
          if (!buyer[1].unwrapOrDefault().fare_withdrawn) {
            return new BN(0)
          }
          return valueObj[key.toString()]
        })
      )
    )
    Promise.all(tvlPromises).then((result) => {
      let tvl = new BN(0)
      result.forEach((buyerSet) => buyerSet.forEach((locked) => (tvl = tvl.add(locked))))
      setTotalValueLocked(tvl)
    })
  }, [api, connected, cabinKeys, valueObj])

  return totalValueLocked
}

/**
 *
 * @param token token to filter stats for
 */
export default function useStats(token: string) {
  const cabinKeys = useCabinKeys(token)
  const totalPassengers = useTotalPassengers(token)
  const totalCabinsBought = useTotalCabinsBought(cabinKeys)
  const totalYieldWithdrawn = useTotalYieldWithdrawn(cabinKeys)
  const totalValueLocked = useTotalValueLocked(cabinKeys)
  return { totalCabinsBought, totalPassengers, totalYieldWithdrawn, totalValueLocked }
}
