export default function truncateAddress(address: string, length = 20) {
  return `${address.slice(0, length)}...`
}
