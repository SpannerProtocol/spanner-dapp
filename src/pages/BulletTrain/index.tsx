import Card from 'components/Card'
import { Heading } from 'components/Text'
import { useTravelCabins } from 'hooks/useQueryTravelCabins'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectManager } from 'state/project/hooks'
import { useBulletTrain } from 'utils/usePath'
import { RouteTabBar, RouteTabMetaData } from '../../components/TabBar'
import { PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import BulletTrainInstructions from './BulletTrainInstructions'
import DpoCatalogue from './Dpo'
import Milestones from './Milestones'
import TravelCabinCatalogue from './TravelCabin'

const tabData: Array<RouteTabMetaData> = [
  {
    id: 'instructions',
    label: 'Instructions',
    path: '/bullettrain/instructions',
  },
  {
    id: 'travelcabins',
    label: 'TravelCabins',
    path: '/bullettrain/travelcabins',
  },
  {
    id: 'dpos',
    label: 'DPOs',
    path: '/bullettrain/dpos',
  },
]

export default function BulletTrain() {
  const selectedPath = useBulletTrain()
  const [activeTab, setActiveTab] = useState<string>('instructions')
  const { projectState } = useProjectManager()
  const [hasBulletTrain, setHasBulletTrain] = useState<boolean>(false)
  const { t } = useTranslation()

  // Using this to check if a project has a bullettrain campaign started
  const travelCabins = useTravelCabins(projectState.selectedProject?.token)

  useEffect(() => {
    if (!selectedPath.item) return
    setActiveTab(selectedPath.item)
  }, [selectedPath.item])

  useEffect(() => {
    if (travelCabins.length === 0) {
      setHasBulletTrain(false)
    } else {
      setHasBulletTrain(true)
    }
  }, [travelCabins])

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '960px', justifyContent: 'center', alignItems: 'center' }}>
      {hasBulletTrain ? (
        <>
          <Wrapper
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Card>
              <Section style={{ marginBottom: '1rem' }}>
                <Heading>{t(`BulletTrain`)}</Heading>
              </Section>
              {projectState.selectedProject && (
                <Section style={{ marginBottom: '1rem' }}>
                  <Milestones />
                </Section>
              )}
              <RouteTabBar activeTab={activeTab} tabs={tabData} margin="0px" level={'primary'} />
            </Card>
          </Wrapper>

          <SectionContainer style={{ minHeight: '750px', marginBottom: '0', width: '100%', marginTop: '0' }}>
            <SpacedSection style={{ marginTop: '0' }}>
              {activeTab === 'instructions' && <BulletTrainInstructions />}
              {activeTab === 'travelcabins' && <TravelCabinCatalogue />}
              {activeTab === 'dpos' && <DpoCatalogue />}
            </SpacedSection>
          </SectionContainer>
        </>
      ) : (
        <Wrapper
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card>
            <Section style={{ marginBottom: '1rem', padding: '1rem' }}>
              <Heading>
                {t(`Looks like {{project}} does not have a BulletTrain yet.`, {
                  project: projectState.selectedProject?.project,
                })}
              </Heading>
            </Section>
          </Card>
        </Wrapper>
      )}
    </PageWrapper>
  )
}
