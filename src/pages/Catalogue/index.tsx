import { FlatCardPlate } from 'components/Card'
import { Heading } from 'components/Text'
import { useQueryTravelCabinsWithKeys } from 'hooks/useQueryTravelCabins'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectManager } from 'state/project/hooks'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import BulletTrainInstructions from './BulletTrainInstructions'
import DpoCatalogue from './Dpo'
import TravelCabinCatalogue from './TravelCabin'

const tabData: Array<TabMetaData> = [
  {
    id: 'tab-instructions',
    className: 'tab instructions-container',
    label: 'Instructions',
  },
  {
    id: 'tab-travelcabins',
    className: 'tab travelcabins-container',
    label: 'TravelCabins',
  },
  {
    id: 'tab-lp-dpo',
    className: 'tab dpo-container',
    label: 'DPO',
  },
]

const tabOptions = ['instructions', 'travelcabins', 'dpo']

export default function Catalogue() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('travelcabins')
  const { projectState } = useProjectManager()
  // Using this to check if a project has a bullettrain campaign started
  const travelCabins = useQueryTravelCabinsWithKeys(projectState.selectedProject?.token)
  const [hasBulletTrain, setHasBulletTrain] = useState<boolean>(false)
  const { t } = useTranslation()

  const handleClick = (indexClicked: number) => {
    setActiveTabIndex(indexClicked)
  }

  useEffect(() => {
    const tabName = tabOptions[activeTabIndex]
    setActiveTab(tabName)
  }, [activeTabIndex])

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
            <FlatCardPlate>
              <Section style={{ marginBottom: '1rem' }}>
                <Heading>BulletTrain</Heading>
              </Section>
              <TabBar
                margin="0px"
                id={'tabbar-catalogue'}
                className={'tabbar-container'}
                tabs={tabData}
                onClick={handleClick}
              />
            </FlatCardPlate>
          </Wrapper>

          <SectionContainer style={{ minHeight: '750px', marginBottom: '0', width: '100%', marginTop: '0' }}>
            <SpacedSection style={{ marginTop: '0' }}>
              {activeTab === 'instructions' && <BulletTrainInstructions />}
              {activeTab === 'travelcabins' && <TravelCabinCatalogue />}
              {activeTab === 'dpo' && <DpoCatalogue />}
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
          <FlatCardPlate>
            <Section style={{ marginBottom: '1rem', padding: '1rem' }}>
              <Heading>
                {t(`projectMissing`, {
                  project: projectState.selectedProject?.project,
                })}
              </Heading>
            </Section>
          </FlatCardPlate>
        </Wrapper>
      )}
    </PageWrapper>
  )
}
