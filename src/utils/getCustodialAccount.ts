import Keyring from '@polkadot/keyring'

export default function getCustodialAccount(address: string) {
  // temporary solution until signing server is complete
  // Derive spanner address from hd key derivation of ethereum address
  const keyring = new Keyring()
  const spannerAccount = keyring.addFromUri(
    `//${process.env.REACT_APP_HARD_KEY}//${address}`,
    { name: 'Custodial' },
    'sr25519'
  )
  return spannerAccount
}
