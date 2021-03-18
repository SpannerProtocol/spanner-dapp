import type { Moment, BlockNumber } from '@polkadot/types/interfaces'
import { u32 } from '@polkadot/types'

/**
 * Converts a block into days
 * @param blockTime Expected blocktime in milliseconds
 * @param block block to convert
 */
export function blockToDays(blockTime: Moment, block: BlockNumber | u32, precision?: number) {
  return (block.toNumber() / (blockTime.toNumber() / 1000) / 3600).toFixed(precision ? precision : 2)
}
