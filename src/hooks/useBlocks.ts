import { useApi } from './useApi'
import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'

export function useExpectedBlockTime(): Moment | undefined {
  const { api, connected } = useApi()
  const [time, setTime] = useState<Moment>()

  useEffect(() => {
    if (!connected) return
    setTime(api.consts.babe.expectedBlockTime)
  }, [api, connected])

  return time
}

export function useSubLastBlock(): BlockNumber | undefined {
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

export function useCurrentTime(): Moment | undefined {
  const { api, connected } = useApi()
  const [currentTime, setCurrentTime] = useState<Moment>()

  useEffect(() => {
    if (!api || !connected) return
    api.query.timestamp.now((result) => setCurrentTime(result))
  }, [api, connected])

  return currentTime
}

/**
 * Returns genesis ts in milliseconds
 */
export function useGenesisTime(): number | undefined {
  const { api, connected } = useApi()
  const expectedBlockTime = useExpectedBlockTime()
  const [genesisTs, setGenesisTs] = useState<number>()

  useEffect(() => {
    if (!connected || !expectedBlockTime) return
    // Get Genesis timestamp
    api.rpc.chain.getBlockHash(1).then((blockHash) =>
      api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
        const methodSetTs = signedBlock.block.extrinsics.find(
          (info) => info.method.method === 'set' && info.method.section === 'timestamp'
        )
        if (methodSetTs) setGenesisTs(parseInt(methodSetTs.method.args.toString()) - expectedBlockTime.toNumber())
      })
    )
  }, [api, connected, expectedBlockTime])

  return genesisTs
}

interface BlockState {
  lastBlock?: BlockNumber
  expectedBlockTime?: Moment
  currentTime?: Moment
  genesisTs?: number
}

export function useBlockManager(): BlockState {
  const expectedBlockTime = useExpectedBlockTime()
  const lastBlock = useSubLastBlock()
  const currentTime = useCurrentTime()
  const genesisTs = useGenesisTime()

  return {
    lastBlock,
    expectedBlockTime,
    currentTime,
    genesisTs,
  }
}
