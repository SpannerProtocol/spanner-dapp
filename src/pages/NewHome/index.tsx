import { CenterWrapper, PageWrapper, Section } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as CircleNext } from '../../assets/svg/circle-next.svg'
import { Header1, Header2, HeavyText } from '../../components/Text'
import { AssetSwiper, BulletTrainStats } from './Asset'
import { Blockchain } from './BlockchainInfo'
import { DPOSwiper, DPOV1Stats } from './DPO'
import { UserAssetSummaryContainer } from './UserAssetSummary'

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

export default function NewHome() {
  // const { lastBlock, expectedBlockTime } = useBlockManager()
  // const constants = useSubstrate()
  // const { chain, genesis } = constants
  const { t } = useTranslation()

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
      <CenterWrapper>
        <Section>
          <Header1>{t(`Spanner Dapp`)}</Header1>
          <Header2>{t(`Dapp for Decentralized Collaboration`)}</Header2>
        </Section>
      </CenterWrapper>
      <HomeContentWrapper>
        <UserAssetSummaryContainer />
        <DPOSwiper />
        <DPOV1Stats />
        <AssetSwiper />
        <BulletTrainStats />
        <Blockchain />
      </HomeContentWrapper>
    </PageWrapper>
  )
}
