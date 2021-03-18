import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReferrerManager } from 'state/referrer/hooks'

export function useParseReferrer() {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const referrer = search.get('ref')
  const project = search.get('project')
  return { referrer, project }
}

/**
 * Store the referrer based on url referral codes
 * Store referrer
 */
export default function useStoreAndVerifyReferrer() {
  const { referrer, project } = useParseReferrer()
  const { referrerState, storeReferrer } = useReferrerManager()

  // Check if the referrer and project from query string is already stored
  // User can be unauthenticated so we store this info first.
  useEffect(() => {
    console.log('state', referrerState)
    if (!referrer || !project) return
    // Update the stored project referrer pair with the user's address
    console.log('referrer', referrerState.referrer)
    if (Object.keys(referrerState).length === 0) {
      storeReferrer({
        [project]: {
          referrer,
        },
      })
    }
    if (referrerState.referrer) {
      if (Object.keys(referrerState.referrer).includes(project)) return
      storeReferrer({
        ...referrerState.referrer,
        [project]: {
          referrer,
        },
      })
    }
  }, [referrer, project, storeReferrer, referrerState])
}
