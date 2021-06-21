import { useEffect, useState } from 'react'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import { useApi } from './useApi'

/**
 * Get all DPOs filtered by a token
 * @param token Token symbol in caps
 * @returns DPOS
 */
export function useDpos(token?: string): DpoInfo[] {
  const { api, connected } = useApi()
  const [dpos, setDpos] = useState<DpoInfo[]>([])

  useEffect(() => {
    if (!connected) return
    setDpos([])
    ;(async () => {
      const allDpos: DpoInfo[] = []
      const entries = await api.query.bulletTrain.dpos.entries()
      entries.forEach((entry) => {
        if (entry[1].isSome) {
          const dpoInfo = entry[1].unwrapOrDefault()
          // Filter for token
          if (token) {
            if (dpoInfo.token_id.eq(token)) {
              allDpos.push(dpoInfo)
            }
          } else {
            allDpos.push(dpoInfo)
          }
        }
      })
      setDpos(allDpos)
    })().catch((err) => console.log(err))
  }, [api, connected, token])

  return dpos
}

export function useSubDpo(dpoIndex: number | string | DpoIndex | null | undefined): DpoInfo | undefined {
  const { api, connected } = useApi()
  const [dpoInfo, setDpoInfo] = useState<DpoInfo | undefined>()

  useEffect(() => {
    if (!connected || !dpoIndex) return
    ;(async () => {
      await api.query.bulletTrain.dpos(dpoIndex, (result) => {
        if (result.isSome) {
          setDpoInfo(result.unwrapOrDefault())
        }
      })
    })().catch(console.error)
  }, [api, connected, dpoIndex])

  return dpoInfo
}

export function useDpoInTargetDpo(dpoInfo: DpoInfo) {
  const { api, connected } = useApi()
  const target = useSubDpo(dpoInfo.target.asDpo[0])
  const [inTarget, setInTarget] = useState<boolean>(false)

  useEffect(() => {
    if (!target || !connected) return
    ;(async () => {
      const entries = await api.query.bulletTrain.dpoMembers.entries(target.index)
      entries.forEach((entry) => {
        if (entry[1].isNone) return
        const member = entry[1].unwrapOrDefault()
        if (member.buyer.isDpo) {
          if (dpoInfo.index.eq(member.buyer.asDpo)) {
            setInTarget(true)
          }
        }
      })
    })()
  }, [target, connected, api, dpoInfo])

  return inTarget
}

/**
 * Returns dpo count. If token is passed then it will filter it by token.
 * @param token token in capitals (e.g. BOLT)
 * @returns number
 */
export function useDpoCount(token?: string): number {
  const { api, connected } = useApi()
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (!connected) return
    ;(async () => {
      const entries = await api.query.bulletTrain.dpos.entries()
      if (!token) {
        setCount(entries.length)
      } else {
        let filteredCount = 0
        entries.forEach((entry) => {
          if (entry[1].isSome) {
            const dpoInfo = entry[1].unwrapOrDefault()
            if (!dpoInfo.token_id.isToken) return
            if (dpoInfo.token_id.asToken.eq(token)) {
              filteredCount = filteredCount + 1
            }
          }
        })
        setCount(filteredCount)
      }
    })().catch(console.error)
  }, [api, connected, token])

  return count
}

export function useQueryRunningDpoCount(): number {
  const { api, connected } = useApi()
  const [dpoCount, setDpoCount] = useState<number>(0)

  useEffect(() => {
    if (!connected) return
    setDpoCount(0)
    api.query.bulletTrain.dpos
      .entries()
      .then((entries) => {
        entries.forEach((entry) => {
          if (entry[1].isSome) {
            const dpoInfo = entry[1].unwrapOrDefault()
            // Filter for token
            if (!dpoInfo.state.isFailed && !dpoInfo.state.isCompleted) {
              setDpoCount((prev) => ++prev)
            }
          }
        })
      })
      .catch((err) => console.log(err))
  }, [api, connected])

  return dpoCount
}
