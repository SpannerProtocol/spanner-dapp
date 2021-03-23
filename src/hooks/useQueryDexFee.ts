import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { u32 } from '@polkadot/types'

export function useQueryDexFee(): [u32, u32] | undefined {
  const { api, connected } = useApi()
  const [dexFee, setDexFee] = useState<[u32, u32]>()

  useEffect(() => {
    if (!connected) return
    setDexFee(api.consts.dex.getExchangeFee)
  }, [api, connected])

  return dexFee
}
