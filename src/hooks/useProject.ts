import { Balance } from '@polkadot/types/interfaces'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { default as projectJson } from '../spanner-projects.json'
import { ProjectJson } from '../utils/getProjectRegistry'
import useProjectInfos from './useProjectInfo'

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

export function useProjectRegistry() {
  return useMemo(() => {
    const projectInfo = projectJson as ProjectJson
    return Object.keys(projectInfo).map((token) => ({
      name: projectInfo[token].name,
      iconPath: projectInfo[token].icon,
      token: token.toUpperCase(),
      description: projectInfo[token].description,
    }))
  }, [])
}

export function useProject() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const projectInfos = useProjectInfos()
  const registries = useProjectRegistry()

  // const registries = useMemo(() => getProjectRegistry(tokenNames), [tokenNames])

  useEffect(() => {
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
            icon: registry.iconPath,
            description: registry.description,
            totalIssuance: projectInfo.totalIssuance,
          },
        ])
      }
    })
  }, [registries, projectInfos])

  return projects
}
