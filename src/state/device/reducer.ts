import { createReducer } from '@reduxjs/toolkit'
import { setDevice, Device } from './actions'

export interface DeviceState {
  readonly device: Device
}

const initialState: DeviceState = {
  device: { device: 'desktop' },
}

export default createReducer<DeviceState>(initialState, (builder) =>
  builder.addCase(setDevice, (state, { payload: { selectedDevice } }) => {
    return {
      ...state,
      device: selectedDevice,
    }
  })
)
