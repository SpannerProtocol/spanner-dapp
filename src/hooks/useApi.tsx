import { useContext } from 'react'
import { ApiState, ApiContext } from '../contexts/ApiProvider'

export const useApi = (): ApiState => {
  return useContext<ApiState>(ApiContext)
}
