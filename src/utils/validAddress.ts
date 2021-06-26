import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'
import { ethers } from 'ethers'

export function isValidSpannerAddress(address: string) {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

export function isValidEthAddress(address: string) {
  return ethers.utils.isAddress(address)
}
