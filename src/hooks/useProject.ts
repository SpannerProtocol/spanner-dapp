import { Balance } from 'spanner-api/types'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useProjectManager } from 'state/project/hooks'
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

interface SelectedProject {
  name: string
  token: string
  totalIssuance: string
  icon: string
  description: string
}

export function useSelectedProject(): SelectedProject | undefined {
  const { projectState } = useProjectManager()
  const projectRegistry = useProjectRegistry()
  const [project, setProject] = useState<SelectedProject>()
  const selectedProject = projectState.selectedProject

  useEffect(() => {
    if (!selectedProject) return
    const selectedProjectRegistry = projectRegistry.find(
      (registry) => registry.token.toUpperCase() === selectedProject.token.toUpperCase()
    )
    if (!selectedProjectRegistry) return
    setProject({
      name: selectedProject.project,
      token: selectedProject.token,
      totalIssuance: selectedProject.totalIssuance,
      icon: selectedProjectRegistry.iconPath,
      description: selectedProjectRegistry.description,
    })
  }, [projectRegistry, selectedProject])

  return project
}
