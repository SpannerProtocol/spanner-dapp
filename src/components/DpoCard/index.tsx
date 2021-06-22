import BN from 'bn.js'
import { AlertIcon, AlertWrapper } from 'components/Alert'
import Card from 'components/Card'
import { DetailCardSimple } from 'components/Card/DetailCard'
import { RowBetween, RowFixed } from 'components/Row'
import { Header4, HeavyText, ItalicText, SText, TokenText } from 'components/Text'
import { Section, StateWrapper } from 'components/Wrapper'
import Decimal from 'decimal.js'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import { blocksToCountDown } from 'utils/formatBlocks'
import getApy from 'utils/getApy'
import { ACTION_ICONS, DPO_STATE_COLORS } from '../../constants'
import { formatToUnit } from '../../utils/formatUnit'

const DpoCardGrid = styled.div`
  display: grid;
  grid-template-areas: 'state info apy bonus';
  grid-template-columns: minmax(40px, 80px) 3fr 1fr 1fr;
  grid-column-gap: 1rem;
  align-items: center;
  text-align: left;
  padding: 1rem;
  justify-content: flex-start;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas: 'state info apy bonus';
    background: transparent;
    grid-template-columns: minmax(40px, 80px) 3fr 1fr 1fr;
    grid-column-gap: 0.25rem;
    margin: 0;
    padding: 0;
    width: 100%;
  `};
`

const ProfileCardGrid = styled.div`
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
    grid-template-areas: 'state info';
    background: transparent;
    grid-template-columns: minmax(40px, 80px) 2fr;
    grid-column-gap: 0.25rem;
    text-align: left;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    width: 100%;
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

  return (
    <>
      {dpoInfo && chainDecimals && expectedBlockTime && (
        <Link to={`/dpos/dpo/${dpoInfo.index.toString()}/details`} style={{ textDecoration: 'none' }}>
          <Card>
            <ProfileCardGrid>
              {dpoInfo.state.isCreated && expiry && (
                <RowFixed>
                  {expiry.isZero() ? (
                    <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                      <SText color="#fff" fontSize="12px" mobileFontSize="8px">
                        {t(`EXPIRED`)}
                      </SText>
                    </StateWrapper>
                  ) : (
                    <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                      <SText color="#fff" fontSize="12px" mobileFontSize="8px">
                        {t(dpoInfo.state.toString())}
                      </SText>
                    </StateWrapper>
                  )}
                </RowFixed>
              )}
              {!dpoInfo.state.isCreated && (
                <RowFixed>
                  <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                    <SText color="#fff" fontSize="12px" mobileFontSize="8px">
                      {t(dpoInfo.state.toString())}
                    </SText>
                  </StateWrapper>
                </RowFixed>
              )}
              <Section>
                <RowBetween>
                  <HeavyText>{dpoInfo.name.toString()}</HeavyText>
                  <ItalicText fontSize="10px">
                    {t(`DPO`)} #{dpoInfo.index.toString()}
                  </ItalicText>
                </RowBetween>
                {actions && actions.length > 0 && (
                  <Section>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RowFixed>
                        <HeavyText width="fit-content">{t(`Pending Actions`)}:</HeavyText>
                        <div style={{ display: 'flex' }}>
                          {actions.map((action, index) => (
                            <AlertWrapper key={index} padding="0" style={{ paddingLeft: '0.5rem' }}>
                              <AlertIcon src={ACTION_ICONS[action.action]} />
                            </AlertWrapper>
                          ))}
                        </div>
                      </RowFixed>
                    </div>
                  </Section>
                )}
              </Section>
            </ProfileCardGrid>
          </Card>
        </Link>
      )}
    </>
  )
}