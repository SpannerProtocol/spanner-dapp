import Divider from 'components/Divider'
import { Header2, SText } from 'components/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces/types'

function MainSection() {
  const { t } = useTranslation()
  return (
    <>
      <Header2>{t(`Failed to crowdfund`)}</Header2>
      <SText>{t(`DPO failed to crowdfund before its expiry. Members received their deposits back`)}.</SText>
      <Divider margin="1rem 0" />
    </>
  )
}

/**
 * ACTIVE STATUS
 * Main objective is to get the user to buy the target or switch if unavailable
 * - Show user valuable information
 * - curState is the state the user filters not dpoInfo.state
 */
export default function FailedCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  return <>{selectedState === 'CREATED' && dpoInfo.state.isFailed && <MainSection />}</>
}
