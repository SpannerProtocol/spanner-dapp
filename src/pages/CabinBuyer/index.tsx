import { ButtonWrapper, PageWrapper, Section, Wrapper } from '../../components/Wrapper'
import { HeavyText, StandardText } from '../../components/Text'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Row, { RowBetween } from '../../components/Row'
import { IconWrapper } from '../../components/Item/TravelCabinCard'
import { getCabinClassImage } from '../../utils/getCabinClass'
import { ReactComponent as Ticket } from '../../assets/svg/ticket.svg'
import { FlatCard } from '../../components/Card'
import { useTranslation } from 'react-i18next'
import { ButtonGray, ButtonPrimary } from '../../components/Button'



export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`


export default function TravelCabinBuyer() {
  return (
    <>
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
              <HeavyText fontSize={'18px'} mobileFontSize={'18px'}
                         style={{ margin: 'auto' }}>{'Spanner TravelCabin Inventory'}</HeavyText>
            </Section>
          </div>

          <HomeContentWrapper>
            <CabinInfo></CabinInfo>
            <YieldAvailable></YieldAvailable>
            <FareAvailable></FareAvailable>
            <Trip></Trip>
            <Activity></Activity>
          </HomeContentWrapper>
        </Wrapper>
      </PageWrapper>
    </>
  )
}

export function CabinInfo() {
  const { t } = useTranslation()

  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
        <RowBetween>
          <IconWrapper>
            <div style={{ maxWidth: '45px', width: '45px' }}>{getCabinClassImage('Bronze')}</div>
          </IconWrapper>
          <div>
            <HeavyText fontSize={'16px'} mobileFontSize={'16px'} style={{ float: 'right' }}>
              {`${t(`TravelCabin`)} ${'Bronze'} ${'#41'}`}
            </HeavyText>
            <Row style={{ justifyContent: 'flex-end' }} padding={'0.5rem 0rem'}>
              <Ticket />
              <StandardText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'}>
                {'1000 BOLT'}
              </StandardText>
            </Row>
          </div>
        </RowBetween>
        <StandardText fontSize={'16px'} mobileFontSize={'16px'} padding={'1rem 0rem'}>
          {'Buyer:DPO#5'}
        </StandardText>

      </FlatCard>

    </>
  )
}

export function YieldAvailable() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontWeight={'700'} fontSize={'14px'} mobileFontSize={'14px'}>{'Yield Available'}</HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'100,000,000 BOLT'}</HeavyText>
          <ButtonWrapper style={{ width: '100px', padding: '0.5rem' }}>
            <ButtonPrimary padding='1rem' fontSize='14px' mobileFontSize='14px'>
              {t(`Withdraw`)}
            </ButtonPrimary>
          </ButtonWrapper>
        </RowBetween>
        <StandardText fontSize={'12px'} mobileFontSize={'12px'}>
          {`Withdrawn:${'0/70'} BOLT`}
        </StandardText>
      </FlatCard>
    </>
  )
}

export function FareAvailable() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontWeight={'700'} fontSize={'14px'} mobileFontSize={'14px'}>{'Fare Available'}</HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'0 BOLT'}</HeavyText>
          <ButtonWrapper style={{ width: '100px', padding: '0.5rem' }}>
            <ButtonGray padding='1rem' fontSize='14px' mobileFontSize='14px'>
              {t(`Withdraw`)}
            </ButtonGray>
          </ButtonWrapper>
        </RowBetween>
        <StandardText fontSize={'12px'} mobileFontSize={'12px'}>
          {`Withdrawn:${'0/70'} BOLT`}
        </StandardText>
      </FlatCard>
    </>
  )
}

const TripDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export function Trip() {
  return (
    <>
      <HeavyText fontWeight={'700'} fontSize={'18px'} mobileFontSize={'18px'}
                 padding={'2rem 0rem'}>{'Trip'}</HeavyText>

      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <Row justifyContent={'flex-end'}>
          <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
            {`block:204324`}
          </StandardText>
        </Row>
        <StandardText fontSize={'14px'} mobileFontSize={'14px'} style={{ margin: 'auto' }}>
          {`0.5 days remaining`}
        </StandardText>
        <div>
          <RowBetween>
            <TripDiv>
              <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
                {`Start`}
              </HeavyText>
              <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
                {`#325920`}
              </StandardText>
            </TripDiv>
            <TripDiv>
              <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
                {`End`}
              </HeavyText>
              <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
                {`325920`}
              </StandardText>
            </TripDiv>
          </RowBetween>
        </div>

      </FlatCard>


    </>
  )
}

export function Activity() {
  return (
    <>
      <HeavyText fontWeight={'700'} fontSize={'18px'} mobileFontSize={'18px'}
                 padding={'2rem 0rem'}>{'Activity'}</HeavyText>
      <ActivityItem></ActivityItem>
      <ActivityItem></ActivityItem>
      <ActivityItem></ActivityItem>
      <ActivityItem></ActivityItem>
      <ActivityItem></ActivityItem>


    </>
  )
}


export function ActivityItem() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <RowBetween>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
            {`Withdraw`}
          </HeavyText>
          <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
            {`0.675 BOLT`}
          </StandardText>
        </RowBetween>
        <RowBetween padding={'0.6rem 0rem'}>
          <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
            {`5gfdsafe......rewqrewf`}`
          </StandardText>
          <StandardText fontSize={'14px'} mobileFontSize={'14px'} padding={'0.6rem 0rem'}>
            {`13 mins ago`}
          </StandardText>
        </RowBetween>
      </FlatCard>
    </>
  )
}
