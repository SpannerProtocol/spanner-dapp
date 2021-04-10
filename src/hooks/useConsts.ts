import { useMemo } from 'react'
import { useApi } from './useApi'

export function usePassengerSeatCap() {
  const { api, connected } = useApi()
  return useMemo(() => (connected ? api.consts.bulletTrain.passengerSeatCap.toNumber() : undefined), [api, connected])
}

export function useDpoSeatCap() {
  const { api, connected } = useApi()
  return useMemo(() => (connected ? api.consts.bulletTrain.dpoSeatCap.toNumber() : undefined), [api, connected])
}

export default function useConsts() {
  const passengerSeatCap = usePassengerSeatCap()
  const dpoSeatCap = useDpoSeatCap()
  return { passengerSeatCap, dpoSeatCap }
}
