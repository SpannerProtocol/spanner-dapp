import { useApi } from './useApi'
import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import blockTimestamp from '../queries/graphql/blockTimestamp'
import type { BlockHash } from '@polkadot/types/interfaces/chain'
import { BlockTimestamp, BlockTimestampVariables } from '../queries/graphql/types/BlockTimestamp'
import { AnyNumber } from '@polkadot/types/types'

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
    if (!connected) return
    api.rpc.chain.getFinalizedHead().then((blockHash) =>
      api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
        setLastBlock(signedBlock.block.header.number.unwrap())
      })
    )
  }, [api, connected])

  return { lastBlock }
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
 * (have bug ,will remove later)
 */
// export function useGenesisTime(): number | undefined {
//   const { api, connected } = useApi()
//   const expectedBlockTime = useExpectedBlockTime()
//   const [genesisTs, setGenesisTs] = useState<number>()
//
//   useEffect(() => {
//     if (!connected || !expectedBlockTime) return
//     // Get Genesis timestamp
//     api.rpc.chain.getBlockHash(1).then((blockHash) => {
//       api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
//         const methodSetTs = signedBlock.block.extrinsics.find(
//           (info) => info.method.method === 'set' && info.method.section === 'timestamp'
//         )
//         if (methodSetTs) setGenesisTs(parseInt(methodSetTs.method.args.toString()) - expectedBlockTime.toNumber())
//       })
//     })
//   }, [api, connected, expectedBlockTime])
//
//   return genesisTs
// }

export function useGenesisTime(): number | undefined {
  const { api, connected } = useApi()
  const expectedBlockTime = useExpectedBlockTime()
  const [blockHash, setBlockHash] = useState<BlockHash>()

  useEffect(() => {
    if (!connected || !expectedBlockTime) return
    // Get Genesis timestamp
    api.rpc.chain.getBlockHash(1).then((blockHash) => {
      setBlockHash(blockHash)
    })
  }, [api, connected, expectedBlockTime])

  const blockHashStr = blockHash ? blockHash.toHex() : ''
  const { loading, data } = useQuery<BlockTimestamp, BlockTimestampVariables>(blockTimestamp, {
    skip: !blockHashStr && blockHashStr !== '',
    variables: {
      hash: blockHashStr,
    },
  })

  if (!loading && data) {
    return parseInt(data.block?.timestamp) * 1000
  } else {
    return undefined
  }
}

export function useBlockTime(blockNumber?: BlockNumber | AnyNumber | Uint8Array): number | undefined {
  const { api, connected } = useApi()
  const expectedBlockTime = useExpectedBlockTime()
  const [blockHash, setBlockHash] = useState<BlockHash>()

  useEffect(() => {
    if (!connected || !expectedBlockTime || !blockNumber) return
    // Get Genesis timestamp
    api.rpc.chain.getBlockHash(blockNumber).then((blockHash) => {
      setBlockHash(blockHash)
    })
  }, [api, blockNumber, connected, expectedBlockTime])

  const blockHashStr = blockHash ? blockHash.toHex() : ''
  const { loading, data } = useQuery<BlockTimestamp, BlockTimestampVariables>(blockTimestamp, {
    skip: !blockHashStr && blockHashStr !== '',
    variables: {
      hash: blockHashStr,
    },
  })

  if (!loading && data) {
    return parseInt(data.block?.timestamp) * 1000
  } else {
    return undefined
  }
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
