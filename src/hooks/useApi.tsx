import { useContext } from 'react'
import { ApiState, ApiContext } from '../environment/ApiProvider'

export const useApi = (): ApiState => {
  return useContext<ApiState>(ApiContext)
}