import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import BN from 'bn.js'

export function useTotalCrowdfundedAmount(token?: string) {
  const { api, connected } = useApi()
  const [totalCrowdfunded, setTotalCrowdfunded] = useState<BN>(new BN(0))

  useEffect(() => {
    if (!connected) return
    const crowdfundedStates = ['ACTIVE', 'RUNNING', 'COMPLETED']
    ;(async () => {
      const entries = await api.query.bulletTrain.dpos.entries()
      let totalAmount = new BN(0)
      entries.forEach((entry) => {
        if (!entry[1].isSome) return
        const dpoInfo = entry[1].unwrapOrDefault()
        if (!crowdfundedStates.includes(dpoInfo.state.toString())) return
        // If token then filter for token
        if (token) {
          if (dpoInfo.token_id.isToken && dpoInfo.token_id.asToken.eq(token)) {
            totalAmount = dpoInfo.target_amount.add(totalAmount)
          }
        } else {
          totalAmount = dpoInfo.target_amount.add(totalAmount)
        }
      })
      setTotalCrowdfunded(totalAmount)
    })()
  }, [api, connected, token])

  return totalCrowdfunded
}
