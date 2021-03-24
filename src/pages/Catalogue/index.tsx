import BulletTrainImage from 'assets/images/bullettrain-vector.png'
import { FlatCardPlate } from 'components/Card'
import { Heading } from 'components/Text'
import React, { useEffect, useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import DpoCatalogue from './Dpo'
import TravelCabinCatalogue from './TravelCabin'
import BulletTrainStats from './Stats'
import styled from 'styled-components'
import { useProjectManager } from 'state/project/hooks'
import { useQueryTravelCabinsWithKeys } from 'hooks/useQueryTravelCabins'
import BulletTrainInstructions from './BulletTrainInstructions'
import { useTranslation } from 'react-i18next'

const BannerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 4fr));
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display:grid;
  grid-template-columns: repeat(1, minmax(0, 4fr));
  `};
`

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
                <Heading>{projectState.selectedProject?.project}&apos;s BulletTrain</Heading>
              </Section>
              <Section style={{ width: '100%' }}>
                <BannerGrid style={{ maxWidth: '100%', marginBottom: '1rem' }}>
                  <img
                    alt="BulletTrain banner"
                    style={{ maxWidth: '100%', display: 'block', height: 'auto', maxHeight: '240px' }}
                    src={BulletTrainImage}
                  />
                  {projectState.selectedProject && <BulletTrainStats token={projectState.selectedProject.token} />}
                </BannerGrid>
              </Section>
            </FlatCardPlate>
          </Wrapper>

          <SectionContainer style={{ minHeight: '750px', marginTop: '20px', marginBottom: '0px', width: '100%' }}>
            <TabBar
              margin="0px"
              id={'tabbar-catalogue'}
              className={'tabbar-container'}
              tabs={tabData}
              onClick={handleClick}
            />
            <SpacedSection>
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
