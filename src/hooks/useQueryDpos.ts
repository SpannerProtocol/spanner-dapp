import { StorageKey } from '@polkadot/types'
import { useEffect, useState } from 'react'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import { useApi } from './useApi'

/**
 * Get all dpos, optionally filter by project token
 */
export function useQueryDposWithKeys(token?: string): Array<[StorageKey, DpoInfo]> {
  const { api } = useApi()
  const [dpoEntries, setDpoEntries] = useState<Array<[StorageKey, DpoInfo]>>([])

  useEffect(() => {
    if (!api) return
    api?.query?.bulletTrain.dpos
      .entries()
      .then((entries) => {
        const unwrapped: Array<[StorageKey, DpoInfo]> = entries.map((entry) => {
          return [entry[0], entry[1].unwrapOrDefault()]
        })
        let filtered = unwrapped
        if (token) {
          filtered = unwrapped.filter((entry) => entry[1].token_id.eq({ Token: token }))
        }
        setDpoEntries(filtered)
      })
      .catch((err) => console.log(err))
  }, [api, token])

  return dpoEntries
}

export function useQueryDpos(): Array<DpoInfo> {
  const dpoEntries = useQueryDposWithKeys()
  const [dpos, setDpos] = useState<Array<DpoInfo>>([])

  useEffect(() => {
    if (!dpoEntries || dpoEntries.length === 0) return
    const unwrappedDpos = dpoEntries.map((entry) => entry[1])
    setDpos(unwrappedDpos)
  }, [dpoEntries])

  return dpos
}

export function useQuerySubscribeDpo(dpoIndex?: number | string): DpoInfo | undefined {
  const { api } = useApi()
  const [dpoInfo, setDpoInfo] = useState<DpoInfo | undefined>()

  useEffect(() => {
    if (!api || !dpoIndex) return
    api?.query?.bulletTrain.dpos(dpoIndex, (result) => {
      if (result.isNone) {
        setDpoInfo(undefined)
      } else {
        setDpoInfo(result.unwrap())
      }
    })
  }, [api, dpoIndex])

  return dpoInfo
}

// Replace with spanfura
export function useRpcUserDpos(address: string | null | undefined) {
  const { api, connected } = useApi()
  const [indexes, setIndexes] = useState<Array<DpoIndex>>([])
  const [dpos, setDpos] = useState<Array<[DpoIndex, DpoInfo]>>([])

  useEffect(() => {
    if (!connected || !address) return
    api?.rpc?.bulletTrain
      ?.getDposOfAccount(address)
      .then((result) => {
        setIndexes(result)
      })
      .catch((err) => console.log(err))
  }, [api, address, connected])

  useEffect(() => {
    if (!indexes) return
    const dpoPromises = indexes.map<Promise<[DpoIndex, DpoInfo]>>(async (index) => [
      index,
      await api.query.bulletTrain.dpos(index).then((result) => result.unwrapOrDefault()),
    ])
    Promise.all(dpoPromises).then((result) => setDpos(result))
  }, [api, indexes])

  return dpos
}

export function useQueryDpo(dpoIndex?: number | string | DpoIndex): DpoInfo | undefined {
  const { api } = useApi()
  const [dpoInfo, setDpoInfo] = useState<DpoInfo | undefined>()

  useEffect(() => {
    if (!api || !dpoIndex) return
    api?.query?.bulletTrain
      .dpos(dpoIndex)
      .then((result) => {
        if (result.isNone) {
          setDpoInfo(undefined)
        } else {
          setDpoInfo(result.unwrap())
        }
      })
      .catch((err) => console.log(err))
  }, [api, dpoIndex])

  return dpoInfo
}

export function useQuerySubscribeDpoCount(): DpoIndex | undefined {
  const { api } = useApi()
  const [dpoCount, setDpoCount] = useState<DpoIndex>()

  useEffect(() => {
    if (!api) return
    api?.query?.bulletTrain.dpoCount((result) => {
      setDpoCount(result)
    })
  }, [api])

  return dpoCount
}

export interface DpoState {
  totalDpos: string
  totalMembers: string
}
