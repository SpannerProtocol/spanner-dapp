import Divider from 'components/Divider'
import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { Header3 } from 'components/Text'
import { useDpoActions } from 'hooks/useDpoActions'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import DpoBuyDpoSeats from './DpoBuyDpoSeats'
import DpoBuyTravelCabin from './DpoBuyTravelCabin'
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
        if (!dpoInfo.target.isTravelCabin) return
        filteredDpoActions.push(
          <DpoBuyTravelCabin
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
      } else if (dpoAction.action === 'dpoBuyDpoSeats') {
        if (!dpoInfo.target.isDpo) return
        filteredDpoActions.push(
          <DpoBuyDpoSeats
            key={index}
            dpoInfo={dpoInfo}
            dpoAction={dpoAction}
            selectedState={selectedState}
            isLast={isLast}
          />
        )
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
  }, [dpoActions, dpoInfo, selectedState])

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
