import { useEffect, useState } from 'react'
import type { BlockNumber } from 'spanner-api/types'
import { useApi } from './useApi'

export function useSubscribeBlocks() {
  const { api, connected } = useApi()
  const [lastBlock, setLastBlock] = useState<BlockNumber>()

  useEffect(() => {
    if (!api || !connected) return
    api?.rpc?.chain.subscribeNewHeads((header) => {
      setLastBlock(header.number.unwrap())
    })
  }, [api, connected])

  return lastBlock
}
