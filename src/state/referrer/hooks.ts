import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { ReferrerState } from './reducer'
import { Referrer, storeReferrer, saveStoredRemotely } from './actions'

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

export function useSaveStoredRemotely() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (referrer: Referrer) => {
      dispatch(saveStoredRemotely({ referrer }))
    },
    [dispatch]
  )
}

interface ReferrerManagerState {
  referrerState: ReferrerState
  storeReferrer: (referrer: Referrer) => void
  saveStoredRemotely: (referrer: Referrer) => void
}

export function useReferrerManager(): ReferrerManagerState {
  const referrerState = useReferrerState()
  const storeReferrer = useStoreReferrer()
  const saveStoredRemotely = useSaveStoredRemotely()
  return { referrerState, storeReferrer, saveStoredRemotely }
}
