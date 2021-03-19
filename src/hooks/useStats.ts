import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { StorageKey } from '@polkadot/types'
import { DpoIndex, TravelCabinIndex } from 'spanner-interfaces'
import BN from 'bn.js'

export function useCabinKeys() {
  const { api, connected } = useApi()
  const [cabinKeys, setCabinKeys] = useState<StorageKey<[TravelCabinIndex]>[]>()

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabins.keys().then((keys) => setCabinKeys(keys))
  }, [connected, api])

  return cabinKeys
}

export function useTotalCabinsBought() {
  const { api, connected } = useApi()
  const [cabinCount, setCabinCount] = useState<number>(0)

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.travelCabinInventory.entries().then((entries) => {
      entries.forEach((inventory) => {
        if (inventory[1].isSome) {
          setCabinCount((prev) => prev + inventory[1].unwrapOrDefault()[0].toNumber())
        }
      })
    })
  }, [connected, api])

  return cabinCount
}

export function useTotalPassengers() {
  const { api, connected } = useApi()
  const [passengerCount, setPassengerCount] = useState<number>(0)
  const [dpoKeys, setDpoKeys] = useState<StorageKey<[DpoIndex]>[]>()

  useEffect(() => {
    if (!connected) return
    api.query.bulletTrain.dpos.keys().then((keys) => setDpoKeys(keys))
  }, [connected, api])

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

export function useTotalYieldWithdrawn() {
  const { api, connected } = useApi()
  const cabinKeys = useCabinKeys()
  const [yieldWithdrawn, setYieldWithdrawn] = useState<BN>(new BN(0))

  useEffect(() => {
    if (!connected || !cabinKeys) return
    cabinKeys.forEach((key) => {
      const cabinIndex = key.args[0]
      api.query.bulletTrain.travelCabinBuyer.entries(cabinIndex).then((buyerInfoEntries) => {
        buyerInfoEntries.forEach((buyer) => {
          if (buyer[1].isSome) {
            const y = buyer[1].unwrapOrDefault().yield_withdrawn
            setYieldWithdrawn((prev) => prev.add(y.toBn()))
          }
        })
      })
    })
  }, [api, connected, cabinKeys])

  return yieldWithdrawn.toString()
}

interface ValueObj {
  [index: string]: BN
}
export function useTotalValueLocked() {
  const { api, connected } = useApi()
  const cabinKeys = useCabinKeys()
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
  }, [api, connected, cabinKeys])

  // Calculate the total value locked from all unwithdrawn bought travel cabins
  useEffect(() => {
    if (!connected || !cabinKeys || !valueObj) return
    if (!Object.keys(cabinKeys).every((k) => Object.keys(valueObj).includes(k))) return
    cabinKeys.forEach((key) => {
      const cabinIndex = key.args[0]
      api.query.bulletTrain.travelCabinBuyer.entries(cabinIndex).then((buyerInfoEntries) => {
        buyerInfoEntries.forEach((buyer) => {
          if (buyer[1].isSome) {
            if (!buyer[1].unwrapOrDefault().fare_withdrawn) return
            setTotalValueLocked((prev) => prev.add(valueObj[cabinIndex.toString()]))
          }
        })
      })
    })
  }, [api, connected, cabinKeys, valueObj])

  return totalValueLocked
}

export default function useStats() {
  const totalCabinsBought = useTotalCabinsBought()
  const totalPassengers = useTotalPassengers()
  const totalYieldWithdrawn = useTotalYieldWithdrawn()
  const totalValueLocked = useTotalValueLocked()
  // const totalMembers = useTotalDpoMembers()
  return { totalCabinsBought, totalPassengers, totalYieldWithdrawn, totalValueLocked }
}
