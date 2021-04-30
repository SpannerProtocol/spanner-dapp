import { createAction } from '@reduxjs/toolkit'

export const addBridgeServer = createAction<boolean>('connections/addBridgeServer')
export const addChain = createAction<'Hammer' | 'Spanner'>('connections/addChain')
export const updateApiConnection = createAction<boolean>('connections/updateApiConnection')
