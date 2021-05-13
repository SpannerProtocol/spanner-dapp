import { useEffect, useState } from 'react'
import { DpoIndex } from 'spanner-interfaces/bulletTrain'
import { useApi } from './useApi'
import { useRpcUserDpos } from './useQueryDpos'
import { useRpcUserTravelCabins } from './useQueryTravelCabins'

export function useUserDpos(address: string | null | undefined) {
  return useRpcUserDpos(address)
}

export function useUserTravelCabins(address: string | null | undefined) {
  return useRpcUserTravelCabins(address)
}

export function useUserItems(address: string | null | undefined) {
  const userDpos = useUserDpos(address)
  const userTravelCabins = useUserTravelCabins(address)
  return { userDpos, userTravelCabins }
}

export function useUserIsDpoMember(
  dpoIndex: number | string | DpoIndex | undefined,
  address: string | null | undefined
) {
  const { api, connected } = useApi()
  const [isMember, setIsMember] = useState<boolean>(false)

  useEffect(() => {
    if (!address || !connected || !dpoIndex) return
    api.query.bulletTrain.dpoMembers.entries(dpoIndex).then((result) => {
      result.forEach((member) => {
        if (member[1].isNone) return
        if (
          member[1].unwrapOrDefault().buyer.isPassenger &&
          member[1].unwrapOrDefault().buyer.asPassenger.eq(address)
        ) {
          setIsMember(true)
        }
      })
    })
  }, [api, connected, address, dpoIndex])

  return isMember
}

export function useUserIsDpoManager(dpoIndex: number | string | DpoIndex, address: string | undefined) {
  const { api, connected } = useApi()
  const [isManager, setIsManager] = useState<boolean>(false)

  useEffect(() => {
    if (!address || !connected) return
    api.query.bulletTrain.dpos(dpoIndex, (result) => {
      if (result.isNone) return
      if (result.unwrapOrDefault().manager.eq(address)) {
        setIsManager(true)
      }
    })
  }, [api, connected, address, dpoIndex])
  return isManager
}

export function useUserInDpo(dpoIndex: number | string | DpoIndex, address: string | undefined) {
  const isMember = useUserIsDpoMember(dpoIndex, address)
  const isManager = useUserIsDpoManager(dpoIndex, address)
  if (isMember || isManager) {
    return {
      inDpo: true,
      role: isManager ? 'Manager' : isMember ? 'Member' : undefined,
    }
  } else {
    return { inDpo: false, role: undefined }
  }
}
