import { createReducer } from '@reduxjs/toolkit'
import { storeReferrer, saveStoredRemotely, Referrer } from './actions'

export interface ReferrerState {
  readonly referrer: Referrer | undefined
}

export const initialState: ReferrerState = {
  referrer: undefined,
}

export default createReducer<ReferrerState>(initialState, (builder) =>
  builder
    .addCase(storeReferrer, (state, { payload: { referrer } }) => {
      return {
        ...state,
        referrer,
      }
    })
    .addCase(saveStoredRemotely, (state, { payload: { referrer } }) => {
      return {
        ...state,
        referrer,
      }
    })
)
