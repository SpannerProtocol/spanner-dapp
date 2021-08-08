import Card, { SecondaryGradientCard } from 'components/Card'
import { SLink } from 'components/Link'
import { RowFixed } from 'components/Row'
import { Header2, Header4, HeavyText, SText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-api/types'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { getDpoTargetCabinBuyer } from 'utils/getTravelCabinBuyer'
import useDpoFees from 'hooks/useDpoFees'
import Divider from 'components/Divider'
import { Grid } from 'components/Grid'

function TargetDpo({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const { chainDecimals } = useSubstrate()

  const amount = useMemo(() => dpoInfo.target_amount.toBn(), [dpoInfo])
  const token = useMemo(() => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : ''), [dpoInfo])
  return (
    <>
      {target && (
        <>
          <SpacedSection>
            <RowFixed width="fit-content">
              <SText>{t(`Crowdfunding for`)}</SText>
              <SLink to={`/dpos/dpo/${target.index.toString()}/profile`} padding="0 0 0 0.25rem">
                <HeavyText color={theme.blue2}>{`${target.name.toString()}`}</HeavyText>
              </SLink>
              <SText>{`, DPO #${target.index.toString()}`}</SText>
            </RowFixed>
            <SText>{`${t(`Amount`)}: ${formatToUnit(
              amount,
              chainDecimals
            )} ${token} (${dpoInfo.target.asDpo[1].toString()} ${t(`Seats`)})`}</SText>
          </SpacedSection>
        </>
      )}
    </>
  )
}

function TargetCabin({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const { chainDecimals } = useSubstrate()

  const { api, connected } = useApi()
  const [inventoryIndexes, setInventoryIndexes] = useState<[TravelCabinIndex, TravelCabinInventoryIndex]>()

  useEffect(() => {
    if (!connected) return
    getDpoTargetCabinBuyer(api, dpoInfo).then((buyer) => {
      if (!buyer) return
      setInventoryIndexes(buyer[0])
    })
  }, [api, connected, dpoInfo])

  const token = useMemo(() => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : ''), [dpoInfo])
  return (
    <>
      {target && (
        <div>
          <SpacedSection>
            <RowFixed width="fit-content">
              <SText>{t(`Crowdfunding for`)}</SText>
              {inventoryIndexes ? (
                <SLink
                  to={`/assets/travelcabin/${target.index.toString()}/inventory/${inventoryIndexes[1].toString()}`}
                  padding="0 0 0 0.25rem"
                >
                  <HeavyText
                    color={theme.blue2}
                  >{`TravelCabin: ${target.name.toString()} #${inventoryIndexes[1].toString()}`}</HeavyText>
                </SLink>
              ) : (
                <SLink to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`} padding="0 0 0 0.25rem">
                  <HeavyText color={theme.blue2}>{`TravelCabin: ${target.name.toString()}`}</HeavyText>
                </SLink>
              )}
            </RowFixed>
            <SText>{`${t(`Amount`)}: ${formatToUnit(target.deposit_amount.toBn(), chainDecimals)} ${token}`}</SText>
          </SpacedSection>
        </div>
      )}
    </>
  )
}

function ManagementFee({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const fees = useDpoFees(dpoInfo.index.toString())
  const theme = useContext(ThemeContext)
  return (
    <>
      {fees && (
        <div>
          <SpacedSection>
            <Header4>{t(`Management Fee`)}</Header4>
          </SpacedSection>
          <SpacedSection>
            <SecondaryGradientCard padding="0.5rem">
              <RowFixed>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                    {fees.base}%
                  </HeavyText>
                  <SText width="100%" fontSize="10px" mobileFontSize="10px" color="#fff" textAlign="center">
                    {t(`Base`)}
                  </SText>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                  <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                    +
                  </HeavyText>
                </div>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                    {fees.management}%
                  </HeavyText>
                  <SText width="100%" fontSize="10px" mobileFontSize="10px" color="#fff" textAlign="center">
                    {t(`Seats`)}
                  </SText>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                  <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                    =
                  </HeavyText>
                </div>
                <div style={{ display: 'block', width: '100%' }}>
                  <HeavyText
                    color={theme.primary1}
                    fontSize="10px"
                    mobileFontSize="10px"
                    width="100%"
                    textAlign="center"
                  >
                    {fees.base + fees.management}%
                  </HeavyText>
                  <SText color={theme.primary1} fontSize="10px" mobileFontSize="10px" textAlign="center" width="100%">
                    {t(`Fee`)}
                  </SText>
                </div>
              </RowFixed>
            </SecondaryGradientCard>
          </SpacedSection>
        </div>
      )}
    </>
  )
}

function ReferralRates({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const dirRefRate = useMemo(() => dpoInfo.direct_referral_rate.toNumber() / 10, [dpoInfo])
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  return (
    <div>
      <SpacedSection>
        <Header4>{t(`Referral Rates`)}</Header4>
      </SpacedSection>
      <SpacedSection>
        <SecondaryGradientCard padding="0.5rem">
          <RowFixed>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={theme.primary1} fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                {dirRefRate}%
              </HeavyText>
              <SText width="100%" fontSize="10px" mobileFontSize="10px" color={theme.primary1} textAlign="center">
                {t(`Direct`)}
              </SText>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
              <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                +
              </HeavyText>
            </div>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={theme.primary1} fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                {100 - dirRefRate}%
              </HeavyText>
              <SText width="100%" fontSize="10px" mobileFontSize="10px" color={theme.primary1} textAlign="center">
                {t(`2nd`)}
              </SText>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
              <HeavyText color="#fff" fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                =
              </HeavyText>
            </div>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText color={'#fff'} fontSize="10px" mobileFontSize="10px" width="100%" textAlign="center">
                {100}%
              </HeavyText>
              <SText color={'#fff'} fontSize="10px" mobileFontSize="10px" textAlign="center" width="100%">
                {t(`Total`)}
              </SText>
            </div>
          </RowFixed>
        </SecondaryGradientCard>
      </SpacedSection>
    </div>
  )
}

export default function Goals({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()

  return (
    <ContentWrapper>
      <Card>
        <Header2>{t(`Goals`)}</Header2>
        <RowFixed>
          {dpoInfo.target.isDpo && <TargetDpo dpoInfo={dpoInfo} />}
          {dpoInfo.target.isTravelCabin && <TargetCabin dpoInfo={dpoInfo} />}
        </RowFixed>
        <Divider margin="1rem 0" />
        <Header2>{t(`Incentive Structure`)}</Header2>
        <Grid columns="2" mobileColumns="2">
          <ManagementFee dpoInfo={dpoInfo} />
          <ReferralRates dpoInfo={dpoInfo} />
        </Grid>
      </Card>
    </ContentWrapper>
  )
}
