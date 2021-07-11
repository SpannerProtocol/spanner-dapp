import { PageWrapper, SpacedSection } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as CircleNext } from '../../assets/svg/circle-next.svg'
import { Header1, SText } from '../../components/Text'
import { AssetSwiper, BulletTrainStats } from './Asset'
import { Blockchain } from './BlockchainInfo'
import { DPOSwiper, DPOV1Stats } from './DPO'
import { UserAssetSummaryContainer } from './UserAssetSummary'
import SpannerBanner from 'assets/images/hero-banner-desktop.jpg'
import { BannerCard } from 'components/Card'

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

export const StyledCircleNextWhite = styled(CircleNext)`
  width: 30px;
  height: 30px;
  margin: 20px;
  fill: white;
`

export const CircleNextIconWrapper = styled.div`
  text-align: center;
  margin: 10px;
`

export default function Home() {
  // const { lastBlock, expectedBlockTime } = useBlockManager()
  // const constants = useSubstrate()
  // const { chain, genesis } = constants
  const { t } = useTranslation()

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
      <BannerCard
        url={SpannerBanner}
        borderRadius="0"
        padding="1rem"
        margin="0 0 1rem 0"
        minHeight="400px"
        mobileMinHeight="300px"
      >
        <Header1 colorIsPrimary>{t(`Spanner Dapp`)}</Header1>
        <SText fontSize="22px" mobileFontSize="18px">
          {t(`Dapp for Decentralized Collaboration`)}
        </SText>
        <SpacedSection margin="2rem 0 1rem 0" mobileMargin="2rem 0 1rem 0">
          <UserAssetSummaryContainer />
        </SpacedSection>
      </BannerCard>
      <HomeContentWrapper>
        <DPOSwiper />
        <DPOV1Stats />
        <AssetSwiper />
        <BulletTrainStats />
        <Blockchain />
      </HomeContentWrapper>
    </PageWrapper>
  )
}
