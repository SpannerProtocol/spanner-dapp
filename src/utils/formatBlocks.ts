import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { u32 } from '@polkadot/types'
import moment from 'moment'

/**
 * Converts a block into days
 * @param blockTime Expected blocktime in milliseconds
 * @param block block to convert
 */
export function blockToDays(blockTime: Moment, block: BlockNumber | u32, precision?: number) {
  return (block.toNumber() / (blockTime.toNumber() / 1000) / 3600).toFixed(precision ? precision : 2)
}

export function tsToDateTime(timestamp: number) {
  return moment.unix(timestamp).format()
}

export function tsToDateTimeHuman(timestamp: number) {
  return moment.unix(timestamp).format('MMMM Do YYYY, h:mm:ss a')
}
export function tsToRelative(timestamp: number) {
  return moment.unix(timestamp).startOf('hour').fromNow()
}
