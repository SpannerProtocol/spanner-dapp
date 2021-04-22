import { useEffect, useState } from 'react'
import { DpoIndex, DpoInfo, DpoMemberInfo } from 'spanner-interfaces'
import { useApi } from './useApi'

export function useQueryDpoMembers(dpoIndex: DpoIndex | number | string): Array<[DpoIndex, DpoMemberInfo]> {
  const { api, connected } = useApi()
  const [dpoMembers, setDpoMembers] = useState<[DpoIndex, DpoMemberInfo][]>([])

  useEffect(() => {
    if (!connected) return
    api?.query?.bulletTrain.dpoMembers
      .entries(dpoIndex)
      .then((entries) => {
        const allMembers: [DpoIndex, DpoMemberInfo][] = []
        entries.forEach((entry) => {
          if (entry[1].isSome) {
            const member = entry[1].unwrapOrDefault()
            allMembers.push([entry[0].args[0], member])
          }
        })
        setDpoMembers(allMembers)
      })
      .catch((err) => console.log(err))
  }, [api, connected, dpoIndex])

  return dpoMembers
}

export function useDpoManager(dpoIndex: DpoIndex | number | string, dpoInfo?: DpoInfo) {
  const { api, connected } = useApi()
  const [manager, setManager] = useState<DpoMemberInfo>()

  useEffect(() => {
    if (!connected || !dpoInfo) return
    api.query.bulletTrain.dpoMembers.entries(dpoIndex).then((entries) => {
      entries.forEach((entry) => {
        if (entry[1].isNone) return
        const member = entry[1].unwrapOrDefault()
        if (member.buyer.isPassenger) {
          if (dpoInfo.manager.eq(member.buyer.asPassenger.toString())) {
            setManager(member)
          }
        }
      })
    })
  }, [api, connected, dpoIndex, dpoInfo])

  return manager
}
