import { useApi } from './useApi'
import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import blockTimestamp from '../queries/graphql/blockTimestamp'
import type { BlockHash } from '@polkadot/types/interfaces/chain'
import { BlockTimestamp, BlockTimestampVariables } from '../queries/graphql/types/BlockTimestamp'
import { AnyNumber } from '@polkadot/types/types'

export function useExpectedBlockTime(): Moment | undefined {
  const { api } = useApi()
  return api?.consts?.babe.expectedBlockTime
}

export function useSubLastBlock() {
  const { api, connected } = useApi()
  const [lastBlock, setLastBlock] = useState<BlockNumber>()

  useEffect(() => {
    if (!connected) return
    let unsub: () => void = () => undefined
    ;(async () => {
      unsub = await api.rpc.chain.subscribeNewHeads((header) => {
        setLastBlock(header.number.unwrap())
      })
    })()
    return () => unsub()
  }, [api, connected])

  return lastBlock
}

export function useGetLastBlock() {
  const { api, connected } = useApi()
  const [lastBlock, setLastBlock] = useState<BlockNumber>()

  useEffect(() => {
    if (!connected) return
    let fetched = false
    api.rpc.chain.getFinalizedHead().then((blockHash) =>
      api.rpc.chain.getBlock(blockHash).then((signedBlock) => {
        !fetched && setLastBlock(signedBlock.block.header.number.unwrap())
      })
    )
    return () => {
      fetched = true
    }
  }, [api, connected])

  return lastBlock
}

export function useCurrentTime(): Moment | undefined {
  const { api, connected } = useApi()
  const [currentTime, setCurrentTime] = useState<Moment>()

  useEffect(() => {
    if (!connected) return
    let unsub: () => void = () => undefined
    ;(async () => {
      unsub = await api.query.timestamp.now((result) => setCurrentTime(result))
    })()
    return () => unsub()
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
    let fetched = false
    api.rpc.chain.getBlockHash(1).then((blockHash) => {
      !fetched && setBlockHash(blockHash)
    })
    return () => {
      fetched = true
    }
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
    let fetched = false
    api.rpc.chain.getBlockHash(blockNumber).then((blockHash) => {
      !fetched && setBlockHash(blockHash)
    })
    return () => {
      fetched = true
    }
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
