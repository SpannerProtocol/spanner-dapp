import { FlatCard } from 'components/Card'
import { SectionHeading } from 'components/Text'
import { ContentWrapper } from 'components/Wrapper'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { DpoAction } from 'utils/getDpoActions'
import { isDpoAvailable, isTravelCabinAvailable } from 'utils/isTargetAvailable'
import DpoBuyDpoSeatsAvailable from './DpoBuyDpoSeats'
import DpoBuyTargetNotAvailable from './DpoBuyTargetNotAvailable'
import DpoBuyTravelCabinAvailable from './DpoBuyTravelCabin'
import ReleaseBonusFromDpo from './ReleaseBonusFromDpo'
import ReleaseFareFromDpo from './ReleaseFareFromDpo'
import ReleaseYieldFromDpo from './ReleaseYieldFromDpo'
import WithdrawFareFromTravelCabin from './WithdrawFareFromTravelCabin'
import WithdrawYieldFromTravelCabin from './WithdrawYieldFromTravelCabin'

interface ActionProviderProps {
  dpoInfo: DpoInfo
  dpoActions?: DpoAction[]
}

/**
 * Provides Action components for a single DPO
 */
function ActionProvider({ dpoInfo }: ActionProviderProps): JSX.Element {
  const { dpoActions, targetTravelCabinInventory, targetDpo } = useDpoActions(dpoInfo)
  const [userActions, setUserActions] = useState<Array<JSX.Element>>()

  // When dpoActions are present, parse the actions and generate Action components
  // Actions assume that the target will be filtered.
  useEffect(() => {
    if (!dpoActions) return
    const filteredDpoActions: JSX.Element[] = []
    dpoActions.forEach((dpoAction) => {
      if (dpoAction.action === 'releaseFareFromDpo') {
        filteredDpoActions.push(<ReleaseFareFromDpo dpoInfo={dpoInfo} dpoAction={dpoAction} />)
      } else if (dpoAction.action === 'withdrawFareFromTravelCabin') {
        filteredDpoActions.push(<WithdrawFareFromTravelCabin dpoInfo={dpoInfo} dpoAction={dpoAction} />)
      } else if (dpoAction.action === 'dpoBuyTravelCabin') {
        // If not available, user needs to set a new target
        if (
          targetTravelCabinInventory &&
          isTravelCabinAvailable(targetTravelCabinInventory) &&
          dpoInfo.target.isTravelCabin
        ) {
          filteredDpoActions.push(<DpoBuyTravelCabinAvailable dpoInfo={dpoInfo} dpoAction={dpoAction} />)
        } else {
          filteredDpoActions.push(<DpoBuyTargetNotAvailable dpoInfo={dpoInfo} dpoAction={dpoAction} />)
        }
      } else if (dpoAction.action === 'dpoBuyDpoSeats') {
        if (!targetDpo || !dpoInfo.target.isDpo) return
        // If not available, user needs to enter index of cabin that is
        if (isDpoAvailable(dpoInfo, targetDpo)) {
          filteredDpoActions.push(<DpoBuyDpoSeatsAvailable dpoInfo={dpoInfo} dpoAction={dpoAction} />)
        } else {
          filteredDpoActions.push(<DpoBuyTargetNotAvailable dpoInfo={dpoInfo} dpoAction={dpoAction} />)
        }
      } else if (dpoAction.action === 'withdrawYieldFromTravelCabin') {
        if (!dpoInfo.target.isTravelCabin) return
        filteredDpoActions.push(<WithdrawYieldFromTravelCabin dpoInfo={dpoInfo} dpoAction={dpoAction} />)
      } else if (dpoAction.action === 'releaseYieldFromDpo') {
        filteredDpoActions.push(<ReleaseYieldFromDpo dpoInfo={dpoInfo} dpoAction={dpoAction} />)
      } else if (dpoAction.action === 'releaseBonusFromDpo') {
        filteredDpoActions.push(<ReleaseBonusFromDpo dpoInfo={dpoInfo} dpoAction={dpoAction} />)
      }
    })
    setUserActions(filteredDpoActions)
  }, [dpoActions, dpoInfo, targetDpo, targetTravelCabinInventory])

  return (
    <>
      {userActions &&
        userActions.length > 0 &&
        userActions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
    </>
  )
}

interface DpoActionsProps {
  dpoIndex: number | string
}

// Need to conditionally render this depending on if users have actions
export default function DpoActions(props: DpoActionsProps) {
  const { dpoIndex } = props
  const dpoInfo = useSubDpo(dpoIndex)
  const { t } = useTranslation()
  const { dpoActions } = useDpoActions(dpoInfo)
  return (
    <>
      {dpoActions && dpoActions.length > 0 && (
        <ContentWrapper>
          <FlatCard margin="0" style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <SectionHeading>{t(`Actions`)}</SectionHeading>
            {dpoInfo && <ActionProvider dpoInfo={dpoInfo} dpoActions={dpoActions} />}
          </FlatCard>
        </ContentWrapper>
      )}
    </>
  )
}
