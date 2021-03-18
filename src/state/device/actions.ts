import { createAction } from '@reduxjs/toolkit'

export interface Device {
  device: string
}

export const setDevice = createAction<{ selectedDevice: Device }>('device/setDevice')
