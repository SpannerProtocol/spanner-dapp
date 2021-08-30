import { useApi } from './useApi'
import { useMemo } from 'react'

export function useDpoSharePercentCap() {
  const { api, connected } = useApi()
  return useMemo(
    () =>
      connected
        ? api.consts.bulletTrain.dpoSharePercentCap
          ? api.consts.bulletTrain.dpoSharePercentCap[0].toNumber() /
            api.consts.bulletTrain.dpoSharePercentCap[1].toNumber()
          : undefined
        : undefined,
    [api, connected]
  )
}
export function useDpoSharePercentMinimum() {
  const { api, connected } = useApi()
  return useMemo(
    () =>
      connected
        ? api.consts.bulletTrain.dpoSharePercentMinimum
          ? api.consts.bulletTrain.dpoSharePercentMinimum[0].toNumber() /
            api.consts.bulletTrain.dpoSharePercentMinimum[1].toNumber()
          : undefined
        : undefined,
    [api, connected]
  )
}
export function usePassengerSharePercentCap() {
  const { api, connected } = useApi()
  return useMemo(
    () =>
      connected
        ? api.consts.bulletTrain.passengerSharePercentCap
          ? api.consts.bulletTrain.passengerSharePercentCap[0].toNumber() /
            api.consts.bulletTrain.passengerSharePercentCap[1].toNumber()
          : undefined
        : undefined,
    [api, connected]
  )
}
export function usePassengerSharePercentMinimum() {
  const { api, connected } = useApi()
  return useMemo(
    () =>
      connected
        ? api.consts.bulletTrain.passengerSharePercentMinimum
          ? api.consts.bulletTrain.passengerSharePercentMinimum[0].toNumber() /
            api.consts.bulletTrain.passengerSharePercentMinimum[1].toNumber()
          : undefined
        : undefined,
    [api, connected]
  )
}

export default function useConsts() {
  const dpoSharePercentCap = useDpoSharePercentCap()
  const dpoSharePercentMinimum = useDpoSharePercentMinimum()
  const passengerSharePercentCap = usePassengerSharePercentCap()
  const passengerSharePercentMinimum = usePassengerSharePercentMinimum()

  return { dpoSharePercentCap, dpoSharePercentMinimum, passengerSharePercentCap, passengerSharePercentMinimum }
}
