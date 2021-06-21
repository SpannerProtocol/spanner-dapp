import BN from 'bn.js'
import { AlertIcon, AlertWrapper } from 'components/Alert'
import Card from 'components/Card'
import { DetailCardSimple } from 'components/Card/DetailCard'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, ItalicText, SText, TokenText, Header4 } from 'components/Text'
import { Section, StateWrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import cdDivide from 'utils/cdDivide'
import { blocksToCountDown } from 'utils/formatBlocks'
import getApy from 'utils/getApy'
import { ACTION_ICONS, DPO_STATE_COLORS } from '../../constants'
import { formatToUnit } from '../../utils/formatUnit'
import Decimal from 'decimal.js'

export const DpoCardGrid = styled.div`
  display: grid;
  grid-template-areas: 'title title';
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  grid-column-gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  justify-content: center;
  text-align: center;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas: 'state info apy bonus';
    background: transparent;
    grid-template-columns: minmax(40px, 80px) 3fr 1fr 1fr;
    grid-column-gap: 0.25rem;
    text-align: left;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    width: 100%;
  `};
`

export const DpoData1 = styled.div`
  grid-area: data1;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  `};
`

export const DpoData2 = styled.div`
  grid-area: data2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  `};
`

export const DpoTitle = styled.div`
  grid-area: title;
  padding-bottom: 0.5rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding-bottom: 0;
  `};
`

export const DpoWrapper = styled(Card)`
  // transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  // &:hover {
  //   cursor: pointer;
  //   box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  //   transform: translate(0, -5px);
  // }
  padding: 0;
  background: transparent;
`

const InlineSection = styled.div`
  display: inline-flex;
  justify-content: center;
  width: 100%
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  justify-content: flex-start;
`};
`

function DpoCardDetails({ dpoInfo, expiry }: { dpoInfo: DpoInfo; expiry?: BN }) {
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const { expectedBlockTime } = useBlockManager()

  const token = dpoInfo && dpoInfo.token_id.isToken && dpoInfo.token_id.asToken.toString()

  return (
    <>
      {dpoInfo.state.isCreated && expectedBlockTime && expiry && (
        <RowFixed>
          <HeavyText width="fit-content">{`${t(`Time left`)}:`}</HeavyText>
          <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
            {blocksToCountDown(expiry.toString(), expectedBlockTime, t('EXPIRED'), ['m', 's'])}
          </SText>
        </RowFixed>
      )}
      <RowFixed>
        <HeavyText width="fit-content">{t(`Cost per Seat`)}:</HeavyText>
        <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
          {formatToUnit(dpoInfo.amount_per_seat, chainDecimals)} <TokenText>{token}</TokenText>
        </SText>
      </RowFixed>
      <RowFixed>
        <HeavyText width="fit-content">{t(`Seats Available`)}:</HeavyText>
        <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
          {dpoInfo.empty_seats.toString()} {t(`Seats`)}
        </SText>
      </RowFixed>
      <RowFixed>
        <HeavyText width="fit-content">{t(`Management Fee`)}:</HeavyText>
        <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
          {dpoInfo.fee.toNumber() / 10}%
        </SText>
      </RowFixed>
    </>
  )
}

export default function DpoCard({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()
  const [expiry, setExpiry] = useState<BN>(new BN(0))
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (!lastBlock || !dpoInfo) return
    if (dpoInfo.state.isCreated) {
      if (dpoInfo.expiry_blk.sub(lastBlock).isNeg()) {
        setExpiry(new BN(0))
      } else {
        setExpiry(dpoInfo.expiry_blk.sub(lastBlock))
      }
    }
  }, [lastBlock, dpoInfo])

  const bonusRate = useMemo(() => {
    if (dpoInfo) {
      const bonus = new Decimal(dpoInfo.target_bonus_estimate.toString())
      const deposit = new Decimal(dpoInfo.target_amount.toString())
      return bonus.div(deposit).mul(new Decimal(100)).toFixed(0)
    }
  }, [dpoInfo])

  return (
    <>
      {dpoInfo && chainDecimals && expectedBlockTime && (
        <>
          <DetailCardSimple smallDetails details={<DpoCardDetails dpoInfo={dpoInfo} expiry={expiry} />}>
            <Link to={`/dpos/dpo/${dpoInfo.index.toString()}/details`} style={{ textDecoration: 'none' }}>
              <DpoCardGrid>
                <RowFixed justifyContent="flex-start">
                  {dpoInfo.state.isCreated && expiry.isZero() ? (
                    <>
                      <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                        <SText color="#fff" fontSize="12px" mobileFontSize="8px">
                          {t(`EXPIRED`)}
                        </SText>
                      </StateWrapper>
                    </>
                  ) : (
                    <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                      <SText color="#fff" fontSize="12px" mobileFontSize="8px">
                        {t(dpoInfo.state.toString())}
                      </SText>
                    </StateWrapper>
                  )}
                </RowFixed>
                <div style={{ display: 'block', width: '100%' }}>
                  <Header4 mobileFontSize="12px" width="fit-content">
                    {dpoInfo.name.toString()}
                  </Header4>
                  <ItalicText fontSize="12px" mobileFontSize="10px">
                    {t(`DPO`)} #{dpoInfo.index.toString()}
                  </ItalicText>
                </div>
                {expectedBlockTime && (
                  <div style={{ display: 'block', width: '100%' }}>
                    <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                      {t(`APY`)}
                    </HeavyText>
                    <HeavyText
                      width="100%"
                      fontSize="18px"
                      mobileFontSize="14px"
                      colorIsPrimary
                      textAlign="left"
                      padding="0"
                    >
                      {`${getApy({
                        totalYield: dpoInfo.target_yield_estimate.toBn(),
                        totalDeposit: dpoInfo.target_amount.toBn(),
                        chainDecimals: chainDecimals,
                        blockTime: expectedBlockTime,
                        period: dpoInfo.target_maturity,
                      }).toString()}%`}
                    </HeavyText>
                  </div>
                )}
                <RowFixed>
                  <div style={{ display: 'block', width: '100%' }}>
                    <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                      {t(`Bonus`)}
                    </HeavyText>
                    <HeavyText
                      width="100%"
                      fontSize="18px"
                      mobileFontSize="14px"
                      colorIsPrimary
                      textAlign="left"
                      padding="0"
                    >
                      {bonusRate}%
                    </HeavyText>
                  </div>
                </RowFixed>
              </DpoCardGrid>
            </Link>
          </DetailCardSimple>
        </>
      )}
    </>
  )
}

export function DpoProfileCard({ dpoIndex }: { dpoIndex: string }) {
  const dpoInfo = useSubDpo(dpoIndex)
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const dpoActions = useDpoActions(dpoInfo)
  const { t } = useTranslation()

  const token = dpoInfo && dpoInfo.token_id.isToken && dpoInfo.token_id.asToken.toString()
  const actions = dpoActions.dpoActions

  const [expiry, setExpiry] = useState<BN>()

  useEffect(() => {
    if (!lastBlock || !dpoInfo) return
    if (dpoInfo.state.isCreated) {
      if (dpoInfo.expiry_blk.sub(lastBlock).isNeg()) {
        setExpiry(new BN(0))
      } else {
        setExpiry(dpoInfo.expiry_blk.sub(lastBlock))
      }
    }
  }, [lastBlock, dpoInfo])

  const bonusPercent =
    dpoInfo &&
    Math.floor(cdDivide(dpoInfo.target_bonus_estimate.toBn(), dpoInfo.target_amount.toBn(), chainDecimals) * 100)

  return (
    <>
      {dpoInfo && chainDecimals && expectedBlockTime && (
        <DpoWrapper style={{ overflow: 'hidden' }}>
          <Link to={`/dpos/dpo/${dpoInfo.index.toString()}/details`} style={{ textDecoration: 'none' }}>
            <DpoCardGrid>
              <DpoTitle>
                <Section>
                  <RowBetween>
                    <div style={{ display: 'block' }}>
                      <HeavyText>{dpoInfo.name.toString()}</HeavyText>
                      <ItalicText fontSize="10px">
                        {t(`DPO`)} #{dpoInfo.index.toString()}
                      </ItalicText>
                    </div>
                    {dpoInfo.state.isCreated && expiry && (
                      <InlineSection style={{ width: 'auto' }}>
                        {expiry.isZero() ? (
                          <>
                            <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                              <SText color="#fff" fontSize="12px" mobileFontSize="10px">
                                {t(`EXPIRED`)}
                              </SText>
                            </StateWrapper>
                          </>
                        ) : (
                          <div style={{ display: 'flex', marginRight: '0.5rem' }}>
                            <SText fontSize="10px" style={{ paddingLeft: '0.2rem' }}>{`${blocksToCountDown(
                              expiry.toString(),
                              expectedBlockTime
                            )}`}</SText>
                          </div>
                        )}
                      </InlineSection>
                    )}
                    {!dpoInfo.state.isCreated && (
                      <InlineSection style={{ width: 'auto' }}>
                        <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                          <SText color="#fff" fontSize="12px" mobileFontSize="10px">
                            {t(dpoInfo.state.toString())}
                          </SText>
                        </StateWrapper>
                      </InlineSection>
                    )}
                  </RowBetween>
                </Section>
                {actions && actions.length > 0 && (
                  <Section>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <InlineSection>
                        <HeavyText width="fit-content">{t(`Pending Actions`)}:</HeavyText>
                        <div style={{ display: 'flex' }}>
                          {actions.map((action, index) => (
                            <AlertWrapper key={index} padding="0" style={{ paddingLeft: '0.5rem' }}>
                              <AlertIcon src={ACTION_ICONS[action.action]} />
                            </AlertWrapper>
                          ))}
                        </div>
                      </InlineSection>
                    </div>
                  </Section>
                )}
              </DpoTitle>
              <DpoData1>
                <InlineSection>
                  <HeavyText width="fit-content">{t(`Crowdfunding`)}:</HeavyText>
                  <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                    {formatToUnit(dpoInfo.target_amount.toBn(), chainDecimals)} {token}
                  </SText>
                </InlineSection>
                {dpoInfo.state.isCreated && (
                  <InlineSection>
                    <HeavyText width="fit-content">{t(`Seats Open`)}:</HeavyText>
                    <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                      {dpoInfo.empty_seats.toString()} {t(`Seats`)}
                    </SText>
                  </InlineSection>
                )}
                <InlineSection>
                  <HeavyText width="fit-content">{t(`Manager Fee`)}:</HeavyText>
                  <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                    {dpoInfo.fee.toNumber() / 10}%
                  </SText>
                </InlineSection>
              </DpoData1>
              <DpoData2>
                <InlineSection>
                  {expectedBlockTime && (
                    <>
                      <HeavyText width="fit-content">{t(`APY`)}:</HeavyText>
                      <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                        {`${getApy({
                          totalYield: dpoInfo.target_yield_estimate.toBn(),
                          totalDeposit: dpoInfo.target_amount.toBn(),
                          chainDecimals: chainDecimals,
                          blockTime: expectedBlockTime,
                          period: dpoInfo.target_maturity,
                        }).toString()} %`}
                      </SText>
                    </>
                  )}
                </InlineSection>
                <InlineSection>
                  <HeavyText width="fit-content">{t(`Bonus`)}:</HeavyText>
                  <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                    {bonusPercent}%
                  </SText>
                </InlineSection>
              </DpoData2>
            </DpoCardGrid>
          </Link>
        </DpoWrapper>
      )}
    </>
  )
}
