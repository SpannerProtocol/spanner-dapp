import { u32 } from '@polkadot/types'
import type { BlockNumber, Moment } from '@polkadot/types/interfaces'
import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import moment from 'moment'
import { isBN } from './formatUnit'

/**
 * Converts a block into days
 * @param blockTime Expected blocktime in milliseconds
 * @param block block to convert
 */
export function blockToDays(block: BlockNumber | u32 | string | BN, blockTime: Moment, precision = 2) {
  let blockBn: BN
  if (typeof block === 'string') {
    blockBn = new BN(block)
  } else if (isBN(block)) {
    blockBn = block
  } else {
    blockBn = block.toBn()
  }
  const blockTimeInS = blockTime.div(new BN(1000))
  return new Decimal(blockBn.mul(blockTimeInS).toString()).dividedBy(24 * 60 * 60).toFixed(precision)
}

/**
 * Converts days into blocks, ceiled
 * @param blockTime Expected blocktime in milliseconds
 * @param days Number of days as integers
 * @returns blocks in BN
 */
export function daysToBlocks(days: number, blockTime: Moment): BN {
  const daysInMs = new BN(days * 24 * 60 * 60 * 1000)
  return daysInMs.div(blockTime)
}

/**
 * Converts a unix ts into human readable format, e.g. March 20th 2021, 4:00:48 pm
 * @param timestamp unix timestamp in seconds
 */
export function tsToDateTimeHuman(timestamp: number) {
  return moment.unix(timestamp).format('MMMM Do YYYY, h:mm:ss a')
}

/**
 * Converts a unix ts to time, e.g. 11:54:22
 * @param timestamp unix timestamp in seconds
 * @returns time as string in 'hh:mm:ss'
 */
export function tsToTime(timestamp: number) {
  return moment.unix(timestamp).format('hh:mm:ss')
}

/**
 *  Converts a unix ts into date time
 * @param timestamp unix timestamp in seconds
 */
export function tsToDateTime(timestamp: number) {
  return moment.unix(timestamp).format('MM/DD/YYYY, hh:mm:ss')
}

/**
 * Converts a unix ts into relative time starting with seconds, e.g. 3 seconds ago
 * @param timestamp unix timestamp in seconds
 */
export function tsToRelative(timestamp: number) {
  return moment.unix(timestamp).startOf('second').fromNow()
}

/**
 * Convert a block to a Epoch Timestamp in milliseconds
 * @param genesisTs timestamp of genesis block
 * @param expectedBlockTime expected block time in milliseconds
 * @param currentBlock the last block processed
 * @returns epoch timestamp in milliseconds
 */
export function blockToTs(genesisTs: number, expectedBlockTime: number, currentBlock: number) {
  return genesisTs + currentBlock * expectedBlockTime
}

export function isoToTs(iso: string) {
  const myDate = new Date(iso)
  const offset = myDate.getTimezoneOffset() * 60 * 1000
  const withOffset = myDate.getTime()
  const withoutOffset = withOffset - offset
  return withoutOffset
}
