import { useEffect, useState } from 'react'
import { DpoIndex, DpoMemberInfo } from 'spanner-interfaces'
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
