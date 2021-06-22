import { default as projectJson } from '../spanner-projects.json'

export interface ProjectRegistry {
  name: string
  token: string
  icon: string
  description: string
  assets: string[]
}
export interface ProjectJson {
  [index: string]: ProjectRegistry
}

export default function getProjectRegistry(token: string | Array<string>): Array<ProjectRegistry> {
  const projectDesc = projectJson as ProjectJson
  if (typeof token === 'string') {
    const projectRegistry = Object.keys(projectDesc).includes(token)
      ? projectDesc[token]
      : { name: token, token: token, icon: 'placeholder-token.svg', description: '', assets: [] }
    return [
      {
        name: projectRegistry.name,
        token: projectRegistry.token,
        description: projectRegistry.description,
        icon: projectRegistry.icon,
        assets: projectRegistry.assets,
      },
    ]
  }
  const registryInfo: Array<ProjectRegistry> = []
  token.forEach((tokenName) => {
    const projectRegistry = Object.keys(projectDesc).includes(tokenName)
      ? projectDesc[tokenName]
      : {
          name: tokenName,
          token: tokenName,
          icon: 'placeholder-token.svg',
          description: '',
          assets: [],
        }
    registryInfo.push({
      name: projectRegistry.name,
      token: projectRegistry.token,
      description: projectRegistry.description,
      icon: projectRegistry.icon,
      assets: projectRegistry.assets,
    })
  })
  return registryInfo
}
