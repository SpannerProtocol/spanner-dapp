import { DpoInfo } from 'spanner-interfaces'

/**
 * Compares the selected state with the current state in DpoInfo
 * and returns a boolean value indicating whether the selectedState is over.
 * @param dpoInfo DpoInfo
 * @param selectedState CREATED | ACTIVE | RUNNING | COMPLETED | FAILED
 * @returns boolean
 */
export default function isDpoStateCompleted(dpoInfo: DpoInfo, selectedState: string): boolean {
  const stateOrder = ['CREATED', 'ACTIVE', 'RUNNING', 'COMPLETED']

  const selectedStateIndex = stateOrder.findIndex((state) => state === selectedState)
  let dpoStateIndex: number
  // Failed is mapped to CREATED in the sequence
  if (dpoInfo.state.eq('FAILED') && selectedState === 'CREATED') {
    return true
  } else {
    // All states that aren't FAILED
    dpoStateIndex = stateOrder.findIndex((state) => dpoInfo.state.eq(state))
  }
  console.log('dpoStateIndex', dpoStateIndex, 'selectedStateIndex', selectedStateIndex)
  return dpoStateIndex > selectedStateIndex
}

export function isDpoStateSelectedState(dpoInfo: DpoInfo, selectedState: string): boolean {
  const isFailed = selectedState === 'CREATED' && dpoInfo.state.isFailed
  return dpoInfo.state.eq(selectedState) || isFailed
}

export function getDpoCompletedStates(dpoInfo: DpoInfo) {
  const states = ['CREATED', 'ACTIVE', 'RUNNING', 'COMPLETED', 'FAILED']
  const completed: string[] = []
  states.forEach((state) => isDpoStateCompleted(dpoInfo, state) && completed.push(state))
  return completed
}
