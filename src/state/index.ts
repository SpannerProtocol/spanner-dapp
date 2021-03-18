import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'
import application from './application/reducer'
import connections from './connections/reducer'
import device from './device/reducer'
import { updateVersion } from './global/actions'
import item from './item/reducer'
import project from './project/reducer'
import user from './user/reducer'
import wallet from './wallet/reducer'
import referrer from './referrer/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', 'project']

if (process.env.NODE_ENV === 'development') {
  PERSISTED_KEYS.push('referrer')
}

console.log('PERSISTED KEYS:', PERSISTED_KEYS)

const store = configureStore({
  reducer: {
    application,
    connections,
    device,
    item,
    project,
    referrer,
    wallet,
    user,
  },
  middleware: [
    ...getDefaultMiddleware({ thunk: false, immutableCheck: false, serializableCheck: false }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
