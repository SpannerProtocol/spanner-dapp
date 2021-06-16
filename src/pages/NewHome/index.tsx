import { FlatCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { PageWrapper, Section, Wrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Heading, HeavyText, SText } from '../../components/Text'
import { ReactComponent as CircleNext } from '../../assets/svg/circle-next.svg'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import SwiperCore, { Pagination } from 'swiper/core'

// install Swiper modules
SwiperCore.use([Pagination])


const HomePageTitle = styled.h1`
  margin: 0.1rem 0rem;
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 0.5rem;
  color: ${({ theme }) => theme.black};
`

export const HomeSectionTitle = styled(HeavyText)`
  font-weight: 700;
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
  text-align: left;
  font-size: 24px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 24px;
   `};
`
export const HomeSectionLabel1 = styled.h4`
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
  text-align: left;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`
export const HomeSectionValue1 = styled.h5`
  font-weight: bold;
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
  text-align: left;
  font-size: 24px;
  color: ${({ theme }) => theme.primary1};
`
export const HomeSectionLabel2 = styled.h4`
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  text-align: left;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
`
export const HomeSectionValue2 = styled.h5`
  font-weight: bold;
  margin: 0.8rem 0.5rem 0.5rem;
  text-align: left;
  font-size: 20px;
  color: ${({ theme }) => theme.primary1};
`
export const HomeSectionValue3 = styled.h5`
  font-weight: bold;
  margin: 0.8rem 0.5rem 0.5rem;
  text-align: left;
  font-size: 14px;
  color: ${({ theme }) => theme.primary1};
`
export const HomeSectionValue4 = styled.h4`
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  text-align: left;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
`
export const HomeSectionValue5 = styled.h5`
  font-weight: bold;
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
  text-align: center;
  font-size: 24px;
  color: ${({ theme }) => theme.primary1};
`

export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`

export const StyledCircleNext = styled(CircleNext)`
  width: 30px;
  height: 30px;
  margin: 20px;
`

export const CircleNextIconWrapper = styled.div`
  text-align: center;
  margin: 10px;
`

export default function NewHome() {
  // const { lastBlock, expectedBlockTime } = useBlockManager()
  // const constants = useSubstrate()
  // const { chain, genesis } = constants
  const { t } = useTranslation()

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
            <HomePageTitle>{t(`Spanner Dapp`)}</HomePageTitle>
            <Heading>{t(`Dapp for Decentralized Collaboration`)}</Heading>
          </Section>
        </div>
        <HomeContentWrapper>
          <FlatCard style={{ textAlign: 'left' }}>
            <HomeSectionTitle>{'User Asset'}</HomeSectionTitle>
            <HomeSectionLabel1>{'Total Asset'}</HomeSectionLabel1>
            <HomeSectionValue1>{'$10000.04'}</HomeSectionValue1>
            <HomeSectionLabel1>{'Earned Yesterday'}</HomeSectionLabel1>
            <HomeSectionValue1>{'$198.04'}</HomeSectionValue1>
          </FlatCard>
          <Swiper pagination={true} spaceBetween={50} className='mySwiper'>
            <SwiperSlide>
              <DPOV1 />
            </SwiperSlide>
            <SwiperSlide>
              <DPOV2 />
            </SwiperSlide>
          </Swiper>
          <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
            <HomeSectionTitle>{'DPO V1 Stats'}</HomeSectionTitle>
            <DPOV1Stats />
          </FlatCard>
          <Swiper pagination={true} spaceBetween={50} className='mySwiper'>
            <SwiperSlide>
              <BulletTrain />
            </SwiperSlide>
            <SwiperSlide>
              <SpannerNFT />
            </SwiperSlide>
          </Swiper>
          <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
            <HomeSectionTitle>{'Spanner BulletTrain Stats'}</HomeSectionTitle>
            <BulletTrainStats />
          </FlatCard>
          <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
            <HomeSectionTitle>{t(`Blockchain Info`)}</HomeSectionTitle>
            <Blockchain />
          </FlatCard>
        </HomeContentWrapper>
      </Wrapper>
    </PageWrapper>
  )
}

export function DPOV1() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '220px' }}>
        <HomeSectionTitle>{'DPO V1'}</HomeSectionTitle>
        <SText fontSize={'18px'}
                      mobileFontSize={'18px'}>
          {'DPO is a novel crowdfunding model extending from affiliate marketing'}</SText>
        <CircleNextIconWrapper>
          <StyledCircleNext />
        </CircleNextIconWrapper>
      </FlatCard>
    </>
  )
}

export function DPOV2() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '220px' }}>
        <HomeSectionTitle>{'DPO V2'}</HomeSectionTitle>
        <SText fontSize={'18px'}
                      mobileFontSize={'18px'}>{'DPO is a novel crowdfunding model extending from affiliate marketing'}</SText>
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h4>
            {'(Coming soon)'}
          </h4>
        </div>
      </FlatCard>
    </>
  )
}

export function DPOV1Stats() {
  return (
    <>
      <RowBetween>
        <HomeSectionLabel2>Total DPOs Quantity</HomeSectionLabel2>
        <HomeSectionValue2>208</HomeSectionValue2>
      </RowBetween>
      <RowBetween>
        <HomeSectionLabel2>Crowdfunding Dpos Quantity</HomeSectionLabel2>
        <HomeSectionValue2>107</HomeSectionValue2>
      </RowBetween>
    </>
  )
}


export function BulletTrain() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '270px' }}>
        <HomeSectionTitle>{'Spanner BulletTrain'}</HomeSectionTitle>
        <SText fontSize={'18px'}
                      mobileFontSize={'18px'}>
          {'BulletTrain (a Growth Template) is an evolutionary viral growth marketing model running on the Spanner Blockchain'}</SText>
        <CircleNextIconWrapper>
          <StyledCircleNext />
        </CircleNextIconWrapper>
      </FlatCard>
    </>
  )
}

export function SpannerNFT() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '270px' }}>
        <HomeSectionTitle>{'Spanner NFT'}</HomeSectionTitle>
        <SText fontSize={'18px'}
                      mobileFontSize={'18px'}>{'DPO V2 is a novel crowdfunding model extending from affiliate marketing'}</SText>
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h4>
            {'(Coming soon)'}
          </h4>
        </div>
      </FlatCard>
    </>
  )
}

export function BulletTrainStats() {
  return (
    <>
      <RowBetween>
        <HomeSectionLabel2>Total Deposited Value</HomeSectionLabel2>
        <HomeSectionValue3>100,000,000 BOLT</HomeSectionValue3>
      </RowBetween>
      <RowBetween>
        <HomeSectionLabel2>Total Yield Distributed</HomeSectionLabel2>
        <HomeSectionValue3>10,049,009 BOLT</HomeSectionValue3>
      </RowBetween>
      <RowBetween>
        <HomeSectionLabel2>Total Bonus Distributed</HomeSectionLabel2>
        <HomeSectionValue3>10,049,009 BOLT</HomeSectionValue3>
      </RowBetween>
    </>
  )
}

export function Blockchain() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const constants = useSubstrate()
  const { chain } = constants
  const { t } = useTranslation()

  return (
    <>
      <RowBetween>
        <HomeSectionLabel2>{t(`Connected to`)}</HomeSectionLabel2>
        <HomeSectionValue4>{chain}</HomeSectionValue4>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween>
          <HomeSectionLabel2>{t(`Estimated Time per Block`)}</HomeSectionLabel2>
          <HomeSectionValue4>{`${expectedBlockTime.toNumber() / 1000} ${t(`seconds`)}`}</HomeSectionValue4>
        </RowBetween>
      )}
      {lastBlock && (
        <>
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <h4>{t(`# of Blocks Finalized`)}</h4>
          </div>
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <HomeSectionValue5>{lastBlock.toString()}</HomeSectionValue5>
          </div>
        </>
      )}
    </>
  )
}

