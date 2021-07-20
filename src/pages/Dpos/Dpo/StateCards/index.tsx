import Divider from 'components/Divider'
import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { Header3 } from 'components/Text'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin, useSubTravelCabinInventory } from 'hooks/useQueryTravelCabins'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
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
  selectedState: string
}

/**
 * Provides Action components for a single DPO
 */
function ActionProvider({ dpoInfo, selectedState }: ActionProviderProps): JSX.Element {
  const dpoActions = useDpoActions(dpoInfo, selectedState)
  // IF TARGET IS DPO
  const targetDpo = useSubDpo(dpoInfo.index)
  // IF TARGET IS CABIN this is okay because the hooks can accept undefined
  const targetCabin = useSubTravelCabin(dpoInfo.target.isTravelCabin ? dpoInfo.target.asTravelCabin : undefined)
  const targetCabinInventoryCount = useSubTravelCabinInventory(targetCabin ? targetCabin.index : undefined)
  const [userActions, setUserActions] = useState<Array<JSX.Element>>()
  const { t } = useTranslation()

  // When dpoActions are present, parse the actions and generate Action components
  // Actions assume that the target will be filtered.
  useEffect(() => {
    if (!dpoActions) return
    const filteredDpoActions: JSX.Element[] = []
    dpoActions.forEach((dpoAction, index) => {
      const isLast = index === dpoActions.length - 1
      if (dpoAction.action === 'releaseFareFromDpo') {
        filteredDpoActions.push(
          <ReleaseFareFromDpo
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      } else if (dpoAction.action === 'withdrawFareFromTravelCabin') {
        filteredDpoActions.push(
          <WithdrawFareFromTravelCabin
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      } else if (dpoAction.action === 'dpoBuyTravelCabin') {
        // If not available, user needs to set a new target
        if (
          dpoInfo.target.isTravelCabin &&
          targetCabinInventoryCount &&
          isTravelCabinAvailable(targetCabinInventoryCount)
        ) {
          filteredDpoActions.push(
            <DpoBuyTravelCabinAvailable
              key={index}
              dpoInfo={dpoInfo}
              dpoAction={dpoAction}
              selectedState={selectedState}
              isLast={isLast}
            />
          )
        } else {
          filteredDpoActions.push(
            <DpoBuyTargetNotAvailable
              key={index}
              dpoInfo={dpoInfo}
              dpoAction={dpoAction}
              selectedState={selectedState}
              isLast={isLast}
            />
          )
        }
      } else if (dpoAction.action === 'dpoBuyDpoSeats') {
        if (!targetDpo || !dpoInfo.target.isDpo) return
        // If not available, user needs to enter index of cabin that is
        if (isDpoAvailable(dpoInfo, targetDpo)) {
          filteredDpoActions.push(
            <DpoBuyDpoSeatsAvailable
              key={index}
              dpoInfo={dpoInfo}
              dpoAction={dpoAction}
              selectedState={selectedState}
              isLast={isLast}
            />
          )
        } else {
          filteredDpoActions.push(
            <DpoBuyTargetNotAvailable
              key={index}
              dpoInfo={dpoInfo}
              dpoAction={dpoAction}
              selectedState={selectedState}
              isLast={isLast}
            />
          )
        }
      } else if (dpoAction.action === 'withdrawYieldFromTravelCabin') {
        if (!dpoInfo.target.isTravelCabin) return
        filteredDpoActions.push(
          <WithdrawYieldFromTravelCabin
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      } else if (dpoAction.action === 'releaseYieldFromDpo') {
        filteredDpoActions.push(
          <ReleaseYieldFromDpo
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      } else if (dpoAction.action === 'releaseBonusFromDpo') {
        filteredDpoActions.push(
          <ReleaseBonusFromDpo
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      }
    })
    setUserActions(filteredDpoActions)
  }, [dpoActions, dpoInfo, selectedState, targetDpo, targetCabin, targetCabinInventoryCount])

  return (
    <>
      {userActions && userActions.length > 0 && (
        <>
          <Divider margin="0.5rem 0" />
          <RowFixed>
            <Header3 width="fit-content">{t(`Actions`)}</Header3>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(
                `Managers should perform actions for the DPO but any user can perform them if they don't want to wait`
              )}
            />
          </RowFixed>
          {userActions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </>
      )}
    </>
  )
}

// Need to conditionally render this depending on if users have actions
export default function DpoActions({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  return <ActionProvider dpoInfo={dpoInfo} selectedState={selectedState} />
}
