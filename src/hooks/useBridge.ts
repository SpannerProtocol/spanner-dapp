import { getHealth } from 'bridge'
import { useAddBridgeServer } from 'state/connections/hooks'
import { AxiosError } from 'axios'
import { useEffect } from 'react'

export function useBridgeHealthCheck() {
  const addBridgeServer = useAddBridgeServer()
  useEffect(() => {
    getHealth()
      .then((response) => {
        if (response.status === 200) {
          addBridgeServer(true)
        }
      })
      .catch((e: AxiosError) => {
        if (e.name === 'Error' && e.message === 'Network Error') {
          addBridgeServer(false)
        }
      })
  }, [addBridgeServer])
}
