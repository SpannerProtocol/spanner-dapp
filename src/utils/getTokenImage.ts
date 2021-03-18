import { default as tokenJson } from '../token-icons.json'

interface TokenJson {
  [index: string]: string
}

interface TokenPathsRespone {
  token: string
  path: string
}

export default function getTokenImagePaths(token: string | Array<string>): Array<TokenPathsRespone> {
  const tokenImagePaths = tokenJson as TokenJson
  if (typeof token === 'string') {
    const path = Object.keys(tokenImagePaths).includes(token) ? tokenImagePaths[token] : 'placeholder-token.svg'
    return [{ token, path }]
  }
  const paths: Array<TokenPathsRespone> = []
  token.forEach((tokenName) => {
    const path = Object.keys(tokenImagePaths).includes(tokenName)
      ? tokenImagePaths[tokenName]
      : 'placeholders-token.svg'
    paths.push({ token: tokenName, path })
  })
  return paths
}
