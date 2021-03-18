import BulletTrainImage from 'assets/images/bullettrain-vector.png'
import { FlatCardPlate } from 'components/Card'
import { Heading } from 'components/Text'
import React, { useEffect, useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Section, SectionContainer, Wrapper } from '../../components/Wrapper'
import DpoCatalogue from './Dpo'
import TravelCabinCatalogue from './TravelCabin'
import BulletTrainStats from './Stats'
import styled from 'styled-components'
import { useProjectManager } from 'state/project/hooks'
import { useQueryTravelCabinsWithKeys } from 'hooks/useQueryTravelCabins'
import BulletTrainInstructions from './BulletTrainInstructions'

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
  const [heading, setHeading] = useState<string>('TravelCabins')
  const { projectState } = useProjectManager()
  // Using this to check if a project has a bullettrain campaign started
  const travelCabins = useQueryTravelCabinsWithKeys(projectState.selectedProject?.token)
  const [hasBulletTrain, setHasBulletTrain] = useState<boolean>(false)

  const handleClick = (indexClicked: number) => {
    setActiveTabIndex(indexClicked)
  }

  useEffect(() => {
    const tabName = tabOptions[activeTabIndex]
    setActiveTab(tabName)
    if (tabName === 'instructions') {
      setHeading('Instructions')
    }
    if (tabName === 'travelcabins') {
      setHeading('TravelCabins')
    }
    if (tabName === 'dpo') {
      setHeading('DPO Passenger Groups')
    }
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
                <TabBar id={'tabbar-catalogue'} className={'tabbar-container'} tabs={tabData} onClick={handleClick} />
                <BannerGrid style={{ maxWidth: '100%', marginBottom: '1rem' }}>
                  <img
                    alt="BulletTrain banner"
                    style={{ maxWidth: '100%', display: 'block', height: 'auto', maxHeight: '240px' }}
                    src={BulletTrainImage}
                  />
                  <BulletTrainStats />
                </BannerGrid>
              </Section>
            </FlatCardPlate>
          </Wrapper>
          <SectionContainer>
            <div style={{ textAlign: 'left' }}>
              <Heading style={{ marginBottom: '1rem' }}>{heading}</Heading>
            </div>
            {activeTab === 'instructions' && <BulletTrainInstructions />}
            {activeTab === 'travelcabins' && <TravelCabinCatalogue />}
            {activeTab === 'dpo' && <DpoCatalogue />}
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
              <Heading>Looks like {projectState.selectedProject?.project} does not have a BulletTrain yet.</Heading>
            </Section>
          </FlatCardPlate>
        </Wrapper>
      )}
    </PageWrapper>
  )
}
