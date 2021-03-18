import { useEffect, useState } from 'react'
import { DpoIndex, DpoMemberInfo } from 'spanner-interfaces'
import { useApi } from './useApi'

export function useQueryDpoMembers(dpoIndex: DpoIndex | number | string): Array<[DpoIndex, DpoMemberInfo]> {
  const { api } = useApi()
  const [dpoMembers, setDpoMembers] = useState<Array<[DpoIndex, DpoMemberInfo]>>([])

  useEffect(() => {
    if (!api) return
    api?.query?.bulletTrain.dpoMembers
      .entries(dpoIndex)
      .then((entries) => {
        const unwrapped = entries.map<[DpoIndex, DpoMemberInfo]>(([storageKey, memberInfoOption]) => {
          return [storageKey.args[0], memberInfoOption.unwrapOrDefault()]
        })
        setDpoMembers(unwrapped)
      })
      .catch((err) => console.log(err))
  }, [api, dpoIndex])

  return dpoMembers
}
