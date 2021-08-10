import Card, { SecondaryGradientCard } from 'components/Card'
import { RowFixed } from 'components/Row'
import { Header2, Header4, HeavyText, SText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import useDpoFees from 'hooks/useDpoFees'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { ThemeContext } from 'styled-components'

function ManagementFee({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const fees = useDpoFees(dpoInfo.index.toString())
  const theme = useContext(ThemeContext)
  return (
    <>
      <Header2>{t(`Incentive Structure`)}</Header2>
      {fees && (
        <>
          <SpacedSection>
            <Header4>{t(`Management Fee`)}</Header4>
          </SpacedSection>
          <SpacedSection>
            <SecondaryGradientCard>
              <RowFixed>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                    {fees.base}%
                  </HeavyText>
                  <SText width="100%" color="#fff" textAlign="center">
                    {t(`Base`)}
                  </SText>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                  <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                    +
                  </HeavyText>
                </div>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                    {fees.management}%
                  </HeavyText>
                  <SText width="100%" color="#fff" textAlign="center">
                    {t(`Seats`)}
                  </SText>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                  <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                    =
                  </HeavyText>
                </div>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText
                    color={theme.primary1}
                    fontSize="18px"
                    mobileFontSize="16px"
                    width="100%"
                    textAlign="center"
                  >
                    {fees.base + fees.management}%
                  </HeavyText>
                  <SText color={theme.primary1} textAlign="center" width="100%">
                    {t(`Fee`)}
                  </SText>
                </div>
              </RowFixed>
            </SecondaryGradientCard>
          </SpacedSection>
        </>
      )}
    </>
  )
}

function ReferralRates({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const dirRefRate = useMemo(() => dpoInfo.direct_referral_rate.toNumber() / 10, [dpoInfo])
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  return (
    <>
      <SpacedSection>
        <Header4>{t(`Referral Rates`)}</Header4>
      </SpacedSection>
      <SpacedSection>
        <SecondaryGradientCard>
          <RowFixed>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={theme.primary1} fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                {dirRefRate}%
              </HeavyText>
              <SText width="100%" color={theme.primary1} textAlign="center">
                {t(`Direct`)}
              </SText>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
              <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                +
              </HeavyText>
            </div>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={theme.primary1} fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                {100 - dirRefRate}%
              </HeavyText>
              <SText width="100%" color={theme.primary1} textAlign="center">
                {t(`2nd`)}
              </SText>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
              <HeavyText color="#fff" fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                =
              </HeavyText>
            </div>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={'#fff'} fontSize="18px" mobileFontSize="16px" width="100%" textAlign="center">
                {100}%
              </HeavyText>
              <SText color={'#fff'} textAlign="center" width="100%">
                {t(`Total`)}
              </SText>
            </div>
          </RowFixed>
        </SecondaryGradientCard>
      </SpacedSection>
    </>
  )
}

export default function IncentiveStructure({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return (
    <ContentWrapper>
      <Card>
        <ManagementFee dpoInfo={dpoInfo} />
        <ReferralRates dpoInfo={dpoInfo} />
      </Card>
    </ContentWrapper>
  )
}
