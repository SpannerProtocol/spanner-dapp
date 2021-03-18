import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { ReferrerState } from './reducer'
import { Referrer, storeReferrer, storeReferee, Referee } from './actions'

export function useReferrerState(): AppState['referrer'] {
  return useSelector<AppState, AppState['referrer']>((state) => state.referrer)
}

export function useStoreReferrer() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (referrer: Referrer) => {
      dispatch(storeReferrer({ referrer }))
    },
    [dispatch]
  )
}

export function useStoreReferee() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (referee: Referee) => {
      dispatch(storeReferee({ referee }))
    },
    [dispatch]
  )
}

interface ReferrerManagerState {
  referrerState: ReferrerState
  storeReferrer: (referrer: Referrer) => void
  storeReferee: (referee: Referee) => void
}

export function useReferrerManager(): ReferrerManagerState {
  const referrerState = useReferrerState()
  const storeReferrer = useStoreReferrer()
  const storeReferee = useStoreReferee()
  return { referrerState, storeReferrer, storeReferee }
}
