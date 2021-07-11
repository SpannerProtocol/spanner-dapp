export default function hexToString(input: string | number) {
  let hex = input.toString()
  if (hex.slice(0, 2) === '0x') {
    hex = hex.slice(2)
  }
  let str = ''
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  }
  return str
}

export function isPrefixedHex(input: string | number) {
  const hex = input.toString()
  return hex.slice(0, 2) === '0x'
}
