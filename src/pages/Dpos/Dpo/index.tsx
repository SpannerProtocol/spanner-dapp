import DetailCard from 'components/Card/DetailCard'
import Divider from 'components/Divider'
import DpoStateBar from 'components/Dpo/DpoStateBar'
import { RouteTabBar, RouteTabMetaData } from 'components/TabBar'
import { ContentWrapper, PageWrapper, SpacedSection } from 'components/Wrapper'
import { usePathDpoInfoTab } from 'hooks/usePath'
import { useSubDpo } from 'hooks/useQueryDpos'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import Activity from './Activity'
import Details from './Details'
import Organization from './Organization'
import Overview from './Overview'
import ActiveCard from './StateCards/Active'
import CompletedCard from './StateCards/Completed'
import CreatedCard, { CreatedDetails } from './StateCards/Created'
import FailedCard from './StateCards/Failed'
import RunningCard, { RunningDetails } from './StateCards/Running'

export default function Dpo(): JSX.Element {
  const path = usePathDpoInfoTab()
  const dpoInfo = useSubDpo(path.dpoIndex)
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('details')
  const [selectedState, setSelectedState] = useState<string | undefined>()

  // Tabs
  const tabData = useMemo<Array<RouteTabMetaData>>(() => {
    if (!dpoInfo) return []
    return [
      {
        id: `activity`,
        label: t(`Activity`),
        path: `/dpos/dpo/${dpoInfo.index.toString()}/activity`,
      },
      {
        id: `organization`,
        label: t(`Organization`),
        path: `/dpos/dpo/${dpoInfo.index.toString()}/organization`,
      },
      {
        id: 'details',
        label: t('Details'),
        path: `/dpos/dpo/${dpoInfo.index.toString()}/details`,
      },
    ]
  }, [dpoInfo, t])

  useEffect(() => {
    if (!dpoInfo) return
    setSelectedState(dpoInfo.state.toString())
  }, [dpoInfo])

  useEffect(() => {
    if (!path.section) return
    setActiveTab(path.section)
  }, [path.section])

  return (
    <>
      {dpoInfo && selectedState ? (
        <PageWrapper>
          <Overview dpoInfo={dpoInfo} />
          <ContentWrapper>
            <DetailCard
              details={
                selectedState === 'CREATED' ? (
                  <CreatedDetails dpoInfo={dpoInfo} />
                ) : selectedState === 'RUNNING' ? (
                  <RunningDetails dpoInfo={dpoInfo} />
                ) : undefined
              }
              margin="0 0 1rem 0"
              mobileMargin="0 0 0.5rem 0"
            >
              <SpacedSection>
                <DpoStateBar
                  dpoInfo={dpoInfo}
                  defaultState={dpoInfo.state.toString()}
                  setSelectedState={setSelectedState}
                />
              </SpacedSection>
              <Divider margin="0.5rem 0" />
              <FailedCard selectedState={selectedState} dpoInfo={dpoInfo} />
              <CreatedCard selectedState={selectedState} dpoInfo={dpoInfo} />
              <ActiveCard selectedState={selectedState} dpoInfo={dpoInfo} />
              <RunningCard selectedState={selectedState} dpoInfo={dpoInfo} />
              <CompletedCard selectedState={selectedState} dpoInfo={dpoInfo} />
            </DetailCard>
          </ContentWrapper>
          <ContentWrapper padding="0 0.5rem">
            <RouteTabBar tabs={tabData} activeTab={activeTab} level={'primary'} margin="0 0 1rem 0" />
          </ContentWrapper>
          {activeTab === 'activity' && <Activity dpoInfo={dpoInfo} />}
          {activeTab === 'organization' && <Organization dpoInfo={dpoInfo} />}
          {activeTab === 'details' && <Details dpoInfo={dpoInfo} />}
        </PageWrapper>
      ) : (
        <>
          <Skeleton height={30} count={1} style={{ margin: '0.5rem 0' }} />
          <Skeleton height={100} count={1} style={{ margin: '0.5rem 0' }} />
          <Skeleton height={50} count={1} style={{ margin: '0.5rem 0' }} />
        </>
      )}
    </>
  )
}
