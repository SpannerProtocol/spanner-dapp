import { useContext } from 'react'
import { SubstrateState, SubstrateContext } from '../environment/SubstrateProvider'

export const useSubstrate = (): SubstrateState => {
  return useContext<SubstrateState>(SubstrateContext)
}
