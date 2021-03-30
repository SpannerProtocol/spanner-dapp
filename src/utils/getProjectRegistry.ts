import { default as projectJson } from '../spanner-projects.json'

interface ProjectRegistryInfo {
  name: string
  token: string
  description: string
  icon: string
}

interface ProjectRegistry {
  name: string
  token: string
  icon: string
  description: string
}
export interface ProjectJson {
  [index: string]: ProjectRegistry
}

export default function getProjectRegistry(token: string | Array<string>): Array<ProjectRegistryInfo> {
  const projectDesc = projectJson as ProjectJson
  if (typeof token === 'string') {
    const projectRegistry = Object.keys(projectDesc).includes(token)
      ? projectDesc[token]
      : { name: token, token: token, icon: 'placeholder-token.svg', description: '' }
    return [
      {
        name: projectRegistry.name,
        token: projectRegistry.token,
        description: projectRegistry.description,
        icon: projectRegistry.icon,
      },
    ]
  }
  const registryInfo: Array<ProjectRegistryInfo> = []
  token.forEach((tokenName) => {
    const projectRegistry = Object.keys(projectDesc).includes(tokenName)
      ? projectDesc[tokenName]
      : { name: tokenName, token: tokenName, icon: 'placeholder-token.svg', description: '' }
    registryInfo.push({
      name: projectRegistry.name,
      token: projectRegistry.token,
      description: projectRegistry.description,
      icon: projectRegistry.icon,
    })
  })
  return registryInfo
}
