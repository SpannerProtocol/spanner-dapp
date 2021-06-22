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

export function useSubLastBlock() {
  const { api, connected } = useApi()
  const [lastBlock, setLastBlock] = useState<BlockNumber>()
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (!connected) return
    api.rpc.chain.subscribeNewHeads((header) => {
      setLastBlock(header.number.unwrap())
    })
    setIsReady(true)
  }, [api, connected])

  return { lastBlock, isReady }
}

export function useGetLastBlock() {
  const { api, connected } = useApi()
  const [lastBlock, setLastBlock] = useState<BlockNumber>()

  useEffect(() => {
    api.rpc.chain.getFinalizedHead().then((blockHash) =>
      api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
        setLastBlock(signedBlock.block.header.number.unwrap())
      })
    )
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
    api.rpc.chain.getBlockHash(1).then((blockHash) => {
      console.log(`blockHash:${blockHash}`)
      api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
        const methodSetTs = signedBlock.block.extrinsics.find(
          (info) => info.method.method === 'set' && info.method.section === 'timestamp'
        )
        if (methodSetTs) setGenesisTs(parseInt(methodSetTs.method.args.toString()) - expectedBlockTime.toNumber())
      })
    })
  }, [api, connected, expectedBlockTime])

  return genesisTs
}

interface BlockState {
  lastBlock?: BlockNumber
  expectedBlockTime?: Moment
  currentTime?: Moment
  genesisTs?: number
  lastBlockReady: boolean
}

export function useBlockManager(): BlockState {
  const expectedBlockTime = useExpectedBlockTime()
  const { lastBlock, isReady: lastBlockReady } = useSubLastBlock()
  const currentTime = useCurrentTime()
  const genesisTs = useGenesisTime()

  return {
    lastBlock,
    expectedBlockTime,
    currentTime,
    genesisTs,
    lastBlockReady,
  }
}
