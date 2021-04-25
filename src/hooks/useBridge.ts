import { getHealth } from 'bridge'
import { useAddBridgeServer, useChainState } from 'state/connections/hooks'
import { AxiosError } from 'axios'
import { useEffect } from 'react'

/**
 * Perform all health checks and set chain on app init
 */
export function useConnectionsInit() {
  const addBridgeServer = useAddBridgeServer()
  const { chain } = useChainState()

  useEffect(() => {
    if (!chain) return
    getHealth(chain.chain)
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
  }, [addBridgeServer, chain])
}
