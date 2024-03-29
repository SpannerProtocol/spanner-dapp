import { SLink } from 'components/Link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'swiper/components/pagination/pagination.min.css'
import SwiperCore, { Pagination } from 'swiper/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'
import bulletTrainBg from '../../assets/images/banner-bullettrain-desktop.jpg'
import Card, { BannerCard } from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { Header2, Header4, HeavyText, SText, TokenText } from '../../components/Text'
import useStats from '../../hooks/useStats'
import { useSubstrate } from '../../hooks/useSubstrate'
import { formatToUnit } from '../../utils/formatUnit'
import { CircleNextIconWrapper, StyledCircleNextWhite } from './index'

// install Swiper modules
SwiperCore.use([Pagination])

export function AssetSwiper() {
  const [activeSlide, setAciveSlide] = useState<number>(0)

  return (
    <BannerCard border="1 solid transparent" url={activeSlide === 0 ? bulletTrainBg : undefined} margin="0 0 1rem 0">
      <Swiper
        pagination={{ clickable: true }}
        spaceBetween={50}
        className="mySwiper"
        onSlideChange={(swiper) => setAciveSlide(swiper.activeIndex)}
      >
        <SwiperSlide>
          <BulletTrain />
        </SwiperSlide>
        <SwiperSlide>
          <SpannerNFT />
        </SwiperSlide>
      </Swiper>
    </BannerCard>
  )
}

export function BulletTrain() {
  const { t } = useTranslation()
  return (
    <>
      <Header2 colorIsPrimary>{t('Spanner BulletTrain')}</Header2>
      <SText fontSize={'18px'} mobileFontSize={'18px'} color={'white'}>
        {t(`Earn token rewards by buying TravelCabins or crowdfund for them with DPOs`)}
      </SText>
      <SLink to={`/assets/travelcabin`}>
        <CircleNextIconWrapper>
          <StyledCircleNextWhite />
        </CircleNextIconWrapper>
      </SLink>
    </>
  )
}

export function SpannerNFT() {
  const { t } = useTranslation()
  return (
    <>
      <Header2>{t('Spanner NFT')}</Header2>
      <SText fontSize={'18px'} mobileFontSize={'18px'}>
        {t(`Create NFTs on Spanner and crowdfund for them with DPOs`)}
      </SText>
      <div style={{ textAlign: 'center', margin: 'auto', padding: '3rem 0' }}>
        <Header4>({t('Coming soon')})</Header4>
      </div>
    </>
  )
}

export function BulletTrainStats() {
  const token = 'BOLT'
  const stats = useStats(token)
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()

  return (
    <Card margin="0 0 1rem 0">
      <Header2>{t('Spanner BulletTrain Stats')}</Header2>
      <RowBetween padding="1rem 0">
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {t('Total Deposited Value')}
        </HeavyText>
        <RowFixed width="fit-content" align="baseline">
          <HeavyText fontSize="22px" mobileFontSize="18px" colorIsPrimary>
            {`${formatToUnit(stats.totalValueLocked, chainDecimals)}`}
          </HeavyText>
          <TokenText fontSize="16px" mobileFontSize="12px" padding="0 0.5rem">
            {`${token}`}
          </TokenText>
        </RowFixed>
      </RowBetween>
      <RowBetween padding="0 0 1rem 0">
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {t('Total Yield Distributed')}
        </HeavyText>
        <RowFixed width="fit-content" align="baseline">
          <HeavyText fontSize="22px" mobileFontSize="18px" colorIsPrimary>
            {`${formatToUnit(stats.totalYieldWithdrawn, chainDecimals)}`}
          </HeavyText>
          <TokenText fontSize="16px" mobileFontSize="12px" padding="0 0.5rem">
            {`${token}`}
          </TokenText>
        </RowFixed>
      </RowBetween>
    </Card>
  )
}
