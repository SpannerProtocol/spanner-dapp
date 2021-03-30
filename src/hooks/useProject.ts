import { Balance } from '@polkadot/types/interfaces'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import getProjectRegistry from 'utils/getProjectRegistry'
import useProjectInfos from './useProjectInfo'
import useTokens from './useTokens'

interface ProjectPath {
  token: string
}

export function useProjectPath(): ProjectPath {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    token: pathSplit[2],
  }
}

export interface ProjectData {
  name: string
  token: string
  icon: string
  description: string
  totalIssuance: Balance
}

export function useProject() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const projectInfos = useProjectInfos()
  const tokens = useTokens()

  const tokenNames = useMemo(() => tokens.map((token) => token.name.toLowerCase()), [tokens])
  const registries = useMemo(() => getProjectRegistry(tokenNames), [tokenNames])

  useEffect(() => {
    if (tokens.length <= 0) return
    if (!projectInfos) return
    setProjects([])
    projectInfos.forEach((projectInfo) => {
      const registry = registries.find((reg) => reg.token.toLowerCase() === projectInfo.token.toLowerCase())
      if (registry) {
        setProjects((prev) => [
          ...prev,
          {
            name: registry.name,
            token: registry.token.toUpperCase(),
            icon: registry.icon,
            description: registry.description,
            totalIssuance: projectInfo.totalIssuance,
          },
        ])
      }
    })
  }, [tokenNames, tokens, registries, projectInfos])

  return projects
}
