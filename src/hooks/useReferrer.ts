import { useEffect, useState } from 'react'
import { useProjectManager } from 'state/project/hooks'
import { readUserReferrer } from 'utils/kvStore'
import { useKvDocClient } from './useKvStore'
import useWallet from './useWallet'

export function useReferrer() {
  const { projectState } = useProjectManager()
  const wallet = useWallet()
  const [referrer, setReferrer] = useState<string>()
  const kvClient = useKvDocClient()

  useEffect(() => {
    if (!projectState || !projectState.selectedProject || !wallet || !wallet.address) return
    readUserReferrer(kvClient, wallet.address, projectState.selectedProject.token).then((result) => {
      if (result) setReferrer(result)
    })
  }, [kvClient, projectState, wallet])

  return referrer
}
