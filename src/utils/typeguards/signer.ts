import { JsonRpcSigner } from '@ethersproject/providers'
import { Signer } from '@polkadot/api/types'

export function isJsonRpcSigner(signer: Signer | JsonRpcSigner): signer is JsonRpcSigner {
  return (signer as JsonRpcSigner).provider !== undefined
}
