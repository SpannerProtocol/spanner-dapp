import { Swiper, SwiperSlide } from 'swiper/react'
import { FlatCard } from '../../components/Card'
import { Header4, SText } from '../../components/Text'
import { RowBetween } from '../../components/Row'
import React from 'react'
import {
  CircleNextIconWrapper,
  HomeSectionLabel2,
  HomeSectionTitle,
  HomeSectionValue2,
  StyledCircleNext,
} from './index'
// Import Swiper styles
import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import SwiperCore, { Pagination } from 'swiper/core'
import { useQueryRunningDpoCount, useQuerySubscribeDpoCount } from '../../hooks/useQueryDpos'
import heroBannerBg from '../../assets/images/hero-banner-desktop.jpg'
import { useTranslation } from 'react-i18next'

// install Swiper modules
SwiperCore.use([Pagination])

export function DPOSwiper() {
  return (
    <Swiper pagination={true} spaceBetween={50} className="mySwiper">
      <SwiperSlide>
        <DPOV1 />
      </SwiperSlide>
      <SwiperSlide>
        <DPOV2 />
      </SwiperSlide>
    </Swiper>
  )
}

export function DPOV1() {
  const { t } = useTranslation()
  return (
    <>
      <FlatCard
        style={{
          textAlign: 'left',
          minHeight: '220px',
          background: `transparent url(${heroBannerBg}) center center no-repeat padding-box`,
        }}
      >
        <HomeSectionTitle>{'DPO V1'}</HomeSectionTitle>
        <SText fontSize={'18px'} mobileFontSize={'18px'}>
          {`${t(`Crowdfund for any crypto assets. Create or join one to Earn`)}!`}
        </SText>
        <CircleNextIconWrapper>
          <StyledCircleNext />
        </CircleNextIconWrapper>
      </FlatCard>
    </>
  )
}

export function DPOV2() {
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', minHeight: '220px' }}>
        <HomeSectionTitle>{'DPO V2'}</HomeSectionTitle>
        <SText fontSize={'18px'} mobileFontSize={'18px'}>
          {`${t(`Cross-chain assets, membership roles and more`)}.`}
        </SText>
        <div style={{ textAlign: 'center', margin: 'auto', padding: '1rem 0' }}>
          <Header4>{'(Coming soon)'}</Header4>
        </div>
      </FlatCard>
    </>
  )
}

export function DPOV1Stats() {
  const dpoCount = useQuerySubscribeDpoCount()
  const runningDpoCount = useQueryRunningDpoCount()
  const { t } = useTranslation()

  return (
    <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
      <HomeSectionTitle>{t(`DPO Stats`)}</HomeSectionTitle>
      {dpoCount && (
        <RowBetween>
          <HomeSectionLabel2>{t(`Total DPOs`)}</HomeSectionLabel2>
          <HomeSectionValue2>{dpoCount.toString()}</HomeSectionValue2>
        </RowBetween>
      )}
      <RowBetween>
        <HomeSectionLabel2>{t(`Running Dpos`)}</HomeSectionLabel2>
        <HomeSectionValue2>{runningDpoCount.toString()}</HomeSectionValue2>
      </RowBetween>
    </FlatCard>
  )
}
