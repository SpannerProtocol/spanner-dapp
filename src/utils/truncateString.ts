export default function truncateString(address: string, length = 20) {
  return `${address.slice(0, length)}...`
}
