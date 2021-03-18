import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { DeviceState } from './reducer'
import { Device, setDevice as selectDevice } from './actions'

interface DeviceStateResponse {
  deviceState: DeviceState
  setDevice: (device: Device) => void
}

export function useDeviceState(): DeviceStateResponse {
  const dispatch = useDispatch<AppDispatch>()
  const deviceState = useSelector<AppState, AppState['device']>((state) => state.device)

  const setDevice = useCallback(
    (device: Device) => {
      dispatch(selectDevice({ selectedDevice: device }))
    },
    [dispatch]
  )

  return { deviceState, setDevice }
}
