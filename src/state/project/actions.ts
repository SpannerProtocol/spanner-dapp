import { createAction } from '@reduxjs/toolkit'

export interface Project {
  project: string
  token: string
  totalIssuance: string
}

export const selectProject = createAction<{ selectedProject: Project }>('project/selectProject')
