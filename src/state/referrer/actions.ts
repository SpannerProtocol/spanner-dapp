import { createAction } from '@reduxjs/toolkit'

export interface ProjectReferrerBinding {
  referrer: string
  user?: string
}

export interface Referrer {
  [index: string]: ProjectReferrerBinding
}

export interface Referee {
  referee: string
}

export const storeReferrer = createAction<{ referrer: Referrer }>('referrer/storeReferrer')
export const storeReferee = createAction<{ referee: Referee }>('referrer/storeReferee')
