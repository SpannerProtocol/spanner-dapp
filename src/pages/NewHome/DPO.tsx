import { SLink } from 'components/Link'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'swiper/components/pagination/pagination.min.css'
import SwiperCore, { Pagination } from 'swiper/core'
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/swiper.min.css'
import heroBannerBg from '../../assets/images/hero-banner-desktop.jpg'
import Card, { BannerCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { Header2, Header4, HeavyText, SText } from '../../components/Text'
import { useQueryRunningDpoCount, useQuerySubscribeDpoCount } from '../../hooks/useQueryDpos'
import { CircleNextIconWrapper, StyledCircleNext } from './index'

// install Swiper modules
SwiperCore.use([Pagination])

export function DPOSwiper() {
  const [activeSlide, setAciveSlide] = useState<number>(0)

  return (
    <BannerCard border="1 solid transparent" url={activeSlide === 0 ? heroBannerBg : undefined} margin="0 0 1rem 0">
      <Swiper
        pagination={{ clickable: true }}
        spaceBetween={50}
        className="mySwiper"
        onSlideChange={(swiper) => setAciveSlide(swiper.activeIndex)}
      >
        <SwiperSlide>
          <DPOV1 />
        </SwiperSlide>
        <SwiperSlide>
          <DPOV2 />
        </SwiperSlide>
      </Swiper>
    </BannerCard>
  )
}

export function DPOV1() {
  const { t } = useTranslation()
  return (
    <>
      <Header2>{'DPO V1'}</Header2>
      <SText fontSize={'18px'} mobileFontSize={'18px'}>
        {`${t(`Crowdfund for any crypto assets. Create or join one to Earn`)}!`}
      </SText>
      <SLink to={`/dpos`}>
        <CircleNextIconWrapper>
          <StyledCircleNext />
        </CircleNextIconWrapper>
      </SLink>
    </>
  )
}

export function DPOV2() {
  const { t } = useTranslation()
  return (
    <>
      <Header2>{'DPO V2'}</Header2>
      <SText fontSize={'18px'} mobileFontSize={'18px'}>
        {`${t(`Cross-chain assets, membership roles and more`)}.`}
      </SText>
      <div style={{ textAlign: 'center', margin: 'auto', padding: '3rem 0' }}>
        <Header4>({t('Coming soon')})</Header4>
      </div>
    </>
  )
}

export function DPOV1Stats() {
  const dpoCount = useQuerySubscribeDpoCount()
  const runningDpoCount = useQueryRunningDpoCount()
  const { t } = useTranslation()

  return (
    <Card margin="0 0 1rem 0">
      <Header2>{t(`DPO Stats`)}</Header2>
      {dpoCount && (
        <RowBetween padding="1rem 0">
          <HeavyText fontSize="18px" mobileFontSize="14px">
            {t(`Total DPOs`)}
          </HeavyText>
          <HeavyText fontSize="22px" mobileFontSize="18px" colorIsPrimary>
            {dpoCount.toString()}
          </HeavyText>
        </RowBetween>
      )}
      <RowBetween padding="0 0 1rem 0">
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {t(`Running Dpos`)}
        </HeavyText>
        <HeavyText fontSize="22px" mobileFontSize="18px" colorIsPrimary>
          {runningDpoCount.toString()}
        </HeavyText>
      </RowBetween>
    </Card>
  )
}
