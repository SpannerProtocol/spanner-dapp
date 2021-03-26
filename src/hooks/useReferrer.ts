import { useEffect, useState } from 'react'
import { useProjectManager } from 'state/project/hooks'
import { useReferrerManager } from 'state/referrer/hooks'
import { readUserReferrer } from 'utils/kvStore'
import { useKvDocClient } from './useKvStore'
import useWallet from './useWallet'

export function useReferrer() {
  const { projectState } = useProjectManager()
  const { referrerState } = useReferrerManager()
  const wallet = useWallet()
  const [referrer, setReferrer] = useState<string>()
  const kvClient = useKvDocClient()

  useEffect(() => {
    if (
      !projectState ||
      !projectState.selectedProject ||
      !referrerState ||
      !referrerState.referrer ||
      !wallet ||
      !wallet.address
    )
      return
    if (referrerState.referrer[projectState.selectedProject.token].storedRemotely) {
      setReferrer(referrerState.referrer[projectState.selectedProject.token].referrer)
    } else {
      readUserReferrer(kvClient, wallet.address, projectState.selectedProject.token).then((result) => {
        if (result) setReferrer(result)
      })
    }
  }, [kvClient, projectState, referrerState, wallet])

  return referrer
}
