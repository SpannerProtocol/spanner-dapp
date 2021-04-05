import { useEffect, useState } from 'react'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import { useApi } from './useApi'

/**
 * Get all dpos, optionally filter by project token
 */
export function useDposWithKeys(token?: string): [DpoIndex, DpoInfo][] {
  const { api, connected } = useApi()
  const [dpoEntries, setDpoEntries] = useState<[DpoIndex, DpoInfo][]>([])

  useEffect(() => {
    if (!connected) return
    setDpoEntries([])
    api.query.bulletTrain.dpos
      .entries()
      .then((entries) => {
        entries.forEach((entry) => {
          if (entry[1].isSome) {
            const dpoInfo = entry[1].unwrapOrDefault()
            // Filter for token
            if (token) {
              if (dpoInfo.token_id.eq(token)) {
                setDpoEntries((prev) => [...prev, [entry[0].args[0], dpoInfo]])
              }
            } else {
              setDpoEntries((prev) => [...prev, [entry[0].args[0], dpoInfo]])
            }
          }
        })
      })
      .catch((err) => console.log(err))
  }, [api, connected, token])

  return dpoEntries
}

export function useSubDpo(dpoIndex: number | string | DpoIndex): DpoInfo | undefined {
  const { api, connected } = useApi()
  const [dpoInfo, setDpoInfo] = useState<DpoInfo | undefined>()

  useEffect(() => {
    if (!connected || !dpoIndex) return
    let unsub: Unsub
    ;(async () => {
      unsub = await api.query.bulletTrain.dpos(dpoIndex, (result) => {
        if (result.isSome) {
          setDpoInfo(result.unwrapOrDefault())
        }
      })
    })().catch(console.error)

    return () => unsub()
  }, [api, connected, dpoIndex])

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
