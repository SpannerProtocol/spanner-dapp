import { useContext } from 'react'
import { SubstrateState, SubstrateContext } from '../contexts/SubstrateProvider'

export const useSubstrate = (): SubstrateState => {
  return useContext<SubstrateState>(SubstrateContext)
}
