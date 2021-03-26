import { createAction } from '@reduxjs/toolkit'

// Might need to add user binding due to multi-accounts vs localStorage
export interface ProjectReferrerBinding {
  referrer: string
  storedRemotely?: boolean
  user?: string
}

export interface Referrer {
  [index: string]: ProjectReferrerBinding
}

export const storeReferrer = createAction<{ referrer: Referrer }>('referrer/storeReferrer')
export const saveStoredRemotely = createAction<{ referrer: Referrer }>('referrer/saveStoredRemotely')
