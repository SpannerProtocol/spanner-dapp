import { MilestoneRewardInfo } from 'spanner-interfaces'
import { useEffect, useState } from 'react'
import { useApi } from './useApi'

export default function useMilestones(token?: string) {
  const { api, connected } = useApi()
  const [milestoneInfo, setMilestoneInfo] = useState<MilestoneRewardInfo>()

  useEffect(() => {
    if (!connected || !token) return
    ;(async () => {
      const data = await api.query.bulletTrain.milestoneReward({ Token: token.toUpperCase() })
      if (data.isSome) {
        setMilestoneInfo(data.unwrapOrDefault())
      }
    })()
  }, [api, connected, token])

  return milestoneInfo
}
