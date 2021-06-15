import React, { useContext } from 'react'
import { PageWrapper, Section, Wrapper } from '../../components/Wrapper'
import { Heading, HeavyText, StandardText } from '../../components/Text'
import styled, { ThemeContext } from 'styled-components'
import { FlatCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { SoldTo } from './soldTo'
import { CabinsCatalogue } from './cabinCatalogue'
import { GlobalMilestoneReward } from './milestone'

const PageTitle = styled.h1`
  margin: 0.1rem 0rem;
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 0.5rem;
  color: ${({ theme }) => theme.black};
`

export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`

export default function BulletTrain() {
  return (
    <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ margin: '1rem 0rem', textAlign: 'center' }}>
          <Section>
            <PageTitle>{'Spanner BulletTrain'}</PageTitle>
            <Heading>{'An evolutionary viral growth marketing model '}</Heading>
          </Section>
        </div>

        <HomeContentWrapper>
          <SpannerBulletTrainStats />
          <GlobalMilestoneReward />
          <CabinsCatalogue/>
          <SoldTo/>
        </HomeContentWrapper>
      </Wrapper>
    </PageWrapper>
  )

}

export function SpannerBulletTrainStats() {
  const theme = useContext(ThemeContext)

  return (
    <FlatCard style={{ textAlign: 'left' }}>
      <HeavyText fontSize={'24px'} mobileFontSize={'24px'} color={theme.primary1}
                 style={{ margin: 'auto' }}>{'100,000,000 BOLT'}</HeavyText>
      <StandardText fontSize={'16px'} mobileFontSize={'16px'} padding={'0rem 0rem 1rem 0rem'}
                    style={{ margin: 'auto' }}>{'Total Deposited Value'}</StandardText>
      <RowBetween>
        <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'10,049,009 BOLT'}</HeavyText>
        <StandardText>{'Total Yield Distributed'}</StandardText>
      </RowBetween>
      <RowBetween>
        <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'48,948,998 BOLT'}</HeavyText>
        <StandardText>{'Total Bonus Distributed'}</StandardText>
      </RowBetween>
    </FlatCard>
  )
}












