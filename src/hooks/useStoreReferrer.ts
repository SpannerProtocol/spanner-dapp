import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useProjectManager } from 'state/project/hooks'
import { Referrer } from 'state/referrer/actions'
import { useReferrerManager } from 'state/referrer/hooks'
import { kvCreateUserReferrer, kvReadUser, readUserReferrer } from 'utils/kvStore'
import { useKvDocClient, useUserKvHasProject } from './useKvStore'
import useWallet from './useWallet'

export function useParseReferrer() {
  const location = useLocation()
  const search = useMemo(() => new URLSearchParams(location.search), [location])
  const [referrerInfo, setReferrerInfo] = useState<{ referrer: string; project: string }>()

  useEffect(() => {
    const referrer = search.get('ref')
    const project = search.get('project')
    if (!referrer || !project) return
    setReferrerInfo({
      referrer,
      project,
    })
  }, [location, search])
  return referrerInfo
}

/**
 * A check to see if user has a referrer stored in kvstore.
 * If user does but isn't tracked in localStorage then will save it to localStorage to
 * avoid more calls to kv store.
 */
export function useUserHasReferrer() {
  const wallet = useWallet()
  const kvClient = useKvDocClient()
  const { projectState } = useProjectManager()
  const { referrerState, saveStoredRemotely } = useReferrerManager()
  const [hasReferrer, setHasReferrer] = useState<boolean>(false)

  const selectedProject = projectState.selectedProject

  useEffect(() => {
    if (!wallet || !wallet.address || !selectedProject) return
    // If that project has a referrer then do nothing
    if (
      referrerState.referrer &&
      referrerState.referrer[selectedProject.token] &&
      referrerState.referrer[selectedProject.token].storedRemotely
    )
      return
    kvReadUser(kvClient, wallet.address).then((result) => {
      if (result && result.Item && result.Item.Project && result.Item.Project[selectedProject.token]) {
        const referrer = result.Item.Project[selectedProject.token].Referrer
        if (referrer) {
          console.info(`Confirmed User has a referrer for project: ${selectedProject.token}`)
          if (
            !referrerState ||
            !referrerState.referrer ||
            !referrerState.referrer[selectedProject.token] ||
            !selectedProject
          )
            return
          saveStoredRemotely({
            [selectedProject.token]: {
              referrer: referrerState.referrer[selectedProject.token].referrer,
              storedRemotely: true,
            },
          })
          setHasReferrer(true)
        }
      }
    })
  }, [kvClient, referrerState, referrerState.referrer, saveStoredRemotely, selectedProject, wallet])

  useEffect(() => {
    if (
      selectedProject &&
      referrerState.referrer &&
      referrerState.referrer[selectedProject.token] &&
      referrerState.referrer[selectedProject.token].storedRemotely
    ) {
      setHasReferrer(true)
    }
  }, [referrerState.referrer, selectedProject, setHasReferrer])

  return hasReferrer
}

/**
 * Store the referrer based on url referral codes
 * Store referrer
 */
export default function useStoreAndVerifyReferrer() {
  const parsedReferrer = useParseReferrer()
  // localStorage referrals
  const { referrerState, storeReferrer, saveStoredRemotely } = useReferrerManager()
  const { projectState } = useProjectManager()
  const kvClient = useKvDocClient()
  const wallet = useWallet()
  const hasProject = useUserKvHasProject()
  // We filter projects by their tokens
  const selectedProject = projectState.selectedProject?.token
  const storedReferrer = referrerState.referrer
  const [saveQueue, setSaveQueue] = useState<Referrer>({ ...storedReferrer })

  // To resolve some async problem in setting saveStoredRemotely
  useEffect(() => {
    if (Object.keys(saveQueue).length === 0) return
    saveStoredRemotely(saveQueue)
  }, [saveQueue, saveStoredRemotely])

  useEffect(() => {
    if (!wallet || !wallet.address) {
      // Only attempt to store referrer if they were parsed via path
      if (!parsedReferrer) return
      // Update the stored project referrer pair with the user's address
      if (!storedReferrer) {
        storeReferrer({
          [parsedReferrer.project]: {
            referrer: parsedReferrer.referrer,
            storedRemotely: false,
          },
        })
      } else if (storedReferrer) {
        // If project not in localStorage, add it.
        if (Object.keys(storedReferrer).includes(parsedReferrer.project)) return
        storeReferrer({
          ...storedReferrer,
          [parsedReferrer.project]: {
            referrer: parsedReferrer.referrer,
            storedRemotely: false,
          },
        })
      }
    } else {
      // If wallet and referrer in localStorage, use it
      if (
        selectedProject &&
        storedReferrer &&
        storedReferrer[selectedProject] &&
        storedReferrer[selectedProject].referrer &&
        hasProject
      ) {
        Object.keys(storedReferrer).forEach((storedProject) => {
          const currentProject = storedReferrer[storedProject]
          if (currentProject.storedRemotely) return
          if (!wallet || !wallet.address) return
          readUserReferrer(kvClient, wallet.address, storedProject).then((result) => {
            if (!result && wallet.address) {
              kvCreateUserReferrer(kvClient, wallet.address, storedProject, currentProject.referrer).then(
                (isSuccess) => {
                  if (isSuccess) {
                    // Can give user confirmation of this when global messaging is done
                    console.info('Successfully stored Referrer.')
                    // using this queue to save state becuase async causing errors
                    setSaveQueue((prev) => ({
                      ...prev,
                      [storedProject]: {
                        referrer: currentProject.referrer,
                        storedRemotely: true,
                      },
                    }))
                  }
                }
              )
            } else {
              console.info('User has referrer stored in kvstore.')
            }
          })
        })
      } else {
        // User is logged in and there are no referrer stored locally, store it to kv store directly
        if (!parsedReferrer) return
        if (!hasProject) return
        readUserReferrer(kvClient, wallet.address, parsedReferrer.project).then((result) => {
          if (!result) {
            if (wallet.address && parsedReferrer.referrer) {
              kvCreateUserReferrer(kvClient, wallet.address, parsedReferrer.project, parsedReferrer.referrer).then(
                (isSuccess) => {
                  if (isSuccess) {
                    // Can give user confirmation of this when global messaging is done
                    console.info('Successfully stored Referrer.')
                    saveStoredRemotely({
                      ...storedReferrer,
                      [parsedReferrer.project]: {
                        referrer: parsedReferrer.referrer,
                        storedRemotely: true,
                      },
                    })
                  }
                }
              )
            }
          } else {
            console.info('User has referrer stored in kvstore.')
          }
        })
      }
    }
  }, [
    kvClient,
    parsedReferrer,
    referrerState,
    saveStoredRemotely,
    selectedProject,
    storeReferrer,
    storedReferrer,
    wallet,
    hasProject,
  ])
}
