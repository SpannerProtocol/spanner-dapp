import { createReducer } from '@reduxjs/toolkit'
import { selectProject, Project } from './actions'

export interface ProjectState {
  readonly selectedProject: Project | undefined
}

export const initialState: ProjectState = {
  selectedProject: {
    project: 'Spanner',
    token: 'BOLT',
    totalIssuance: '1000000000',
  },
}

export default createReducer<ProjectState>(initialState, (builder) =>
  builder.addCase(selectProject, (state, { payload: { selectedProject } }) => {
    return {
      ...state,
      selectedProject,
    }
  })
)
