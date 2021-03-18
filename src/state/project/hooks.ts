import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { ProjectState } from './reducer'
import { Project, selectProject } from './actions'

export function useProjectState(): AppState['project'] {
  return useSelector<AppState, AppState['project']>((state) => state.project)
}

export function useSelectProject() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (project: Project) => {
      dispatch(selectProject({ selectedProject: project }))
    },
    [dispatch]
  )
}

interface ProjectManagerState {
  projectState: ProjectState
  setProject: (project: Project) => void
}

export function useProjectManager(): ProjectManagerState {
  const projectState = useProjectState()
  const setProject = useSelectProject()
  return { projectState, setProject }
}
