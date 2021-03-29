export default function truncateString(address: string, length = 20) {
  return `${address.slice(0, length)}...`
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddr(address: string, chars = 3): string {
  return `${address.substring(0, chars + 2)}...${address.substring(46 - chars)}`
}
