import { createReducer } from '@reduxjs/toolkit'
import { storeReferrer, storeReferee, Referrer, Referee } from './actions'

export interface ReferrerState {
  readonly referrer: Referrer | undefined
  readonly referee: Referee | undefined
}

export const initialState: ReferrerState = {
  referrer: undefined,
  referee: undefined,
}

export default createReducer<ReferrerState>(initialState, (builder) =>
  builder
    .addCase(storeReferrer, (state, { payload: { referrer } }) => {
      return {
        ...state,
        referrer,
      }
    })
    .addCase(storeReferee, (state, { payload: { referee } }) => {
      return {
        ...state,
        referee,
      }
    })
)
