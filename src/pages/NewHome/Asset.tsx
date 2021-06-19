import { Swiper, SwiperSlide } from 'swiper/react'
import { FlatCard } from '../../components/Card'
import { Header4, SText } from '../../components/Text'
import { RowBetween } from '../../components/Row'
import React from 'react'
import {
  CircleNextIconWrapper,
  HomeSectionLabel2,
  HomeSectionTitle,
  HomeSectionValue3,
  StyledCircleNext,
} from './index'

// Import Swiper styles
import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import SwiperCore, { Pagination } from 'swiper/core'
import useStats from '../../hooks/useStats'
import { useSubstrate } from '../../hooks/useSubstrate'
import { formatToUnit } from '../../utils/formatUnit'

// install Swiper modules
SwiperCore.use([Pagination])

export function AssetSwiper() {
  return (
    <Swiper pagination={true} spaceBetween={50} className="mySwiper">
      <SwiperSlide>
        <BulletTrain />
      </SwiperSlide>
      <SwiperSlide>
        <SpannerNFT />
      </SwiperSlide>
    </Swiper>
  )
}

export function BulletTrain() {
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '270px' }}>
        <HomeSectionTitle>{'Spanner BulletTrain'}</HomeSectionTitle>
        <SText fontSize={'18px'} mobileFontSize={'18px'}>
          {
            'BulletTrain (a Growth Template) is an evolutionary viral growth marketing model running on the Spanner Blockchain'
          }
        </SText>
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
        <SText fontSize={'18px'} mobileFontSize={'18px'}>
          {'DPO V2 is a novel crowdfunding model extending from affiliate marketing'}
        </SText>
        <div style={{ textAlign: 'center', margin: 'auto', padding: '1rem 0' }}>
          <Header4>{'(Coming soon)'}</Header4>
        </div>
      </FlatCard>
    </>
  )
}

export function BulletTrainStats() {
  const token = 'BOLT'
  const stats = useStats(token)
  const { chainDecimals } = useSubstrate()

  return (
    <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
      <HomeSectionTitle>{'Spanner BulletTrain Stats'}</HomeSectionTitle>
      <RowBetween>
        <HomeSectionLabel2>Total Deposited Value</HomeSectionLabel2>
        <HomeSectionValue3> {`${formatToUnit(stats.totalValueLocked, chainDecimals)} ${token}`}</HomeSectionValue3>
      </RowBetween>
      <RowBetween>
        <HomeSectionLabel2>Total Yield Distributed</HomeSectionLabel2>
        <HomeSectionValue3>{`${formatToUnit(stats.totalYieldWithdrawn, chainDecimals)} ${token}`}</HomeSectionValue3>
      </RowBetween>
      {/*<RowBetween>*/}
      {/*  <HomeSectionLabel2>Total Bonus Distributed</HomeSectionLabel2>*/}
      {/*  <HomeSectionValue3>10,049,009 BOLT</HomeSectionValue3>*/}
      {/*</RowBetween>*/}
    </FlatCard>
  )
}