import { getHealth } from 'bridge'
import { useAddBridgeServer } from 'state/connections/hooks'
import { AxiosError } from 'axios'

export function useBridgeHealthCheck() {
  const addBridgeServer = useAddBridgeServer()
  getHealth()
    .then((response) => {
      console.log('bridge:', response)
      if (response.data) {
        addBridgeServer(true)
      }
    })
    .catch((e: AxiosError) => {
      if (e.name === 'Error' && e.message === 'Network Error') {
        addBridgeServer(false)
      }
    })
}
