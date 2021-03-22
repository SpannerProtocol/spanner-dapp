import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { ApiPromise } from '@polkadot/api'
import { u32 } from '@polkadot/types'
import moment from 'moment'

/**
 * Converts a block into days
 * @param blockTime Expected blocktime in milliseconds
 * @param block block to convert
 */
export function blockToDays(blockTime: Moment, block: BlockNumber | u32, precision?: number) {
  return ((block.toNumber() * blockTime.toNumber()) / 1000 / 3600).toFixed(precision ? precision : 2)
}

/**
 * Converts a block into hours
 * @param blockTime Expected blocktime in milliseconds
 * @param block block to convert
 */
export function blockToHours(blockTime: Moment, block: BlockNumber | u32, precision?: number) {
  return ((block.toNumber() * blockTime.toNumber()) / 1000 / 60).toFixed(precision ? precision : 2)
}

/**
 * Converts a unix ts into a datetime object
 * @param timestamp unix timestamp in seconds
 */
export function tsToDateTime(timestamp: number) {
  return moment.unix(timestamp).format()
}

/**
 * Converts a unix ts into human readable format, e.g. March 20th 2021, 4:00:48 pm
 * @param timestamp unix timestamp in seconds
 */
export function tsToDateTimeHuman(timestamp: number) {
  return moment.unix(timestamp).format('MMMM Do YYYY, h:mm:ss a')
}

/**
 * Converts a unix ts into relative time starting with seconds, e.g. 3 seconds ago
 * @param timestamp unix timestamp in seconds
 */
export function tsToRelative(timestamp: number) {
  return moment.unix(timestamp).startOf('second').fromNow()
}

/**
 * Get the timestamp for that block
 * @param api PolkadotJS ApiPromise Instance
 * @param block BlockNumber
 */
export async function blockToTsAsync(api: ApiPromise, block: BlockNumber) {
  const blockHash = await api.rpc.chain.getBlockHash(block)
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  const methodSetTs = signedBlock.block.extrinsics.find(
    (info) => info.method.method === 'set' && info.method.section === 'timestamp'
  )
  if (methodSetTs) return parseInt(methodSetTs.method.args.toString()) / 1000
}

export function blockToTs(genesisTs: number, expectedBlockTime: number, currentBlock: number) {
  return genesisTs + currentBlock * expectedBlockTime
}
