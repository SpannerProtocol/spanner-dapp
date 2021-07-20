import LightBanner from 'assets/images/banner-spanner-light.png'
import Card, { BannerCard } from 'components/Card'
import DpoAllFilters from 'components/Dpo/DpoAllFilters'
import DpoCard from 'components/Dpo/DpoCard'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { Header1, Header3, Header4, HeavyText, TokenText } from 'components/Text'
import { CenterWrapper, ContentWrapper, PageWrapper, SpacedSection } from 'components/Wrapper'
import { useTotalCrowdfundedAmount } from 'hooks/useDpoStats'
import { useDpoCount, useDpos } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { useProjectManager } from 'state/project/hooks'
import { formatToUnit } from 'utils/formatUnit'

function DpoOverviewCard({ token }: { token: string }) {
  const { t } = useTranslation()
  const dpoCount = useDpoCount(token)
  const crowdfundedAmount = useTotalCrowdfundedAmount(token)
  const { chainDecimals } = useSubstrate()
  return (
    <BannerCard url={LightBanner} borderRadius="0">
      <ContentWrapper>
        <Header1 colorIsPrimary>{t(`DPOs`)}</Header1>
        <Header3>
          {t(`Organizations crowdfunding for crypto assets. Participate to Earn!`)}{' '}
          <QuestionHelper
            text={t(
              `Earn Yield on Deposits, Management Fee for Creating a DPO, Bonus for Referrals and Milestone Rewards just for participating`
            )}
            size={14}
            backgroundColor={'transparent'}
            padding="0 0.25rem 0 0.25rem"
          />
        </Header3>
        <SpacedSection>
          <RowBetween>
            <Card margin="0 0.5rem">
              <CenterWrapper display="block">
                <HeavyText colorIsPrimary fontSize="24px" mobileFontSize="18px" width="100%" textAlign="center">
                  {dpoCount}
                </HeavyText>
                <Header4>{t(`Total DPOs`)}</Header4>
              </CenterWrapper>
            </Card>
            <Card margin="0 0.5rem">
              <CenterWrapper display="block">
                <RowFixed justifyContent="center" align="baseline">
                  <HeavyText colorIsPrimary fontSize="24px" mobileFontSize="18px" padding="0">
                    {formatToUnit(crowdfundedAmount, chainDecimals)}
                  </HeavyText>
                  <TokenText padding="0 0.25rem">{token}</TokenText>
                </RowFixed>
                <Header4>{t(`Total Crowdfunded`)}</Header4>
              </CenterWrapper>
            </Card>
          </RowBetween>
        </SpacedSection>
      </ContentWrapper>
    </BannerCard>
  )
}

// A list of DPOs with search functionality
export default function Dpos() {
  const { projectState: project } = useProjectManager()
  const token = useMemo(() => (project.selectedProject ? project.selectedProject.token : 'BOLT'), [project])
  const unfilteredDpos = useDpos(token)
  const [filteredDpos, setFilteredDpos] = useState<DpoInfo[]>([])

  return (
    <>
      <PageWrapper>
        <DpoOverviewCard token={token} />
        <ContentWrapper>
          <DpoAllFilters unfilteredDpos={unfilteredDpos} setFilteredDpos={setFilteredDpos} />
          {filteredDpos.map((dpoInfo, index) => {
            return <DpoCard key={index} dpoInfo={dpoInfo} />
          })}
        </ContentWrapper>
      </PageWrapper>
    </>
  )
}
