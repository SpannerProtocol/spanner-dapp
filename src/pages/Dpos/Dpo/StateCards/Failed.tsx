import { Header2, SText } from 'components/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { StateOverlay } from 'components/Overlay'
import { isDpoStateSelectedState } from 'utils/dpoStateCompleted'

function MainSection({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)

  return (
    <StateOverlay isOn={!dpoStateIsSelectedState}>
      <Header2>{t(`Failed to crowdfund`)}</Header2>
      <SText>{t(`DPO failed to crowdfund before its expiry. Members received their deposits back`)}.</SText>
    </StateOverlay>
  )
}

/**
 * ACTIVE STATUS
 * Main objective is to get the user to buy the target or switch if unavailable
 * - Show user valuable information
 * - curState is the state the user filters not dpoInfo.state
 */
export default function FailedCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  return <>{selectedState === 'FAILED' && <MainSection dpoInfo={dpoInfo} selectedState={selectedState} />}</>
}
