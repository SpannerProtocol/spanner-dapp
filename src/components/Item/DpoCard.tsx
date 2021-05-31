import BN from 'bn.js'
import { AlertIcon, AlertWrapper } from 'components/Alert'
import Card from 'components/Card'
import { RowBetween } from 'components/Row'
import { HeavyText, ItalicText, SText } from 'components/Text'
import { Section, StateWrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoIndex } from 'spanner-interfaces'
import styled from 'styled-components'
import cdDivide from 'utils/cdDivide'
import { blocksToCountDown } from 'utils/formatBlocks'
import getApy from 'utils/getApy'
import { ACTION_ICONS, DPO_STATE_COLORS } from '../../constants'
import { formatToUnit } from '../../utils/formatUnit'

export const DpoInnerCard = styled.div`
  display: grid;
  grid-template-areas:
    'title title'
    'data1 data2'
    'data1 data2';
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  grid-column-gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  justify-content: center;
  text-align: center;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas:
    'title title'
    'data1 data2';
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    grid-column-gap: 0.5rem;
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
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
    transform: translate(0, -5px);
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.9rem;
`};
`

const InlineSection = styled.div`
  display: inline-flex;
  justify-content: center;
  width: 100%
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  justify-content: flex-start;
`};
`

export default function DpoCard({ dpoIndex }: { dpoIndex: DpoIndex }) {
  const dpoInfo = useSubDpo(dpoIndex)
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime, genesisTs } = useBlockManager()
  const { t } = useTranslation()
  const [expiry, setExpiry] = useState<BN>()

  const token = dpoInfo && dpoInfo.token_id.isToken && dpoInfo.token_id.asToken.toString()

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
      {dpoInfo && chainDecimals && expectedBlockTime && genesisTs && (
        <DpoWrapper style={{ overflow: 'hidden' }}>
          <Link to={`/item/dpo/${dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
            <DpoInnerCard>
              <DpoTitle>
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
                          <HeavyText
                            fontSize="12px"
                            mobileFontSize="10px"
                            style={{ paddingLeft: '0.2rem' }}
                          >{`${blocksToCountDown(expiry.toString(), expectedBlockTime, t('EXPIRED'))}`}</HeavyText>
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
                    {dpoInfo.fee.toNumber() / 10} %
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
                <InlineSection>
                  <HeavyText width="fit-content">{t(`Direct Referral`)}:</HeavyText>
                  <SText width="fit-content" style={{ paddingLeft: '0.5rem' }}>
                    {dpoInfo.direct_referral_rate.div(new BN(10)).toString()}%
                  </SText>
                </InlineSection>
              </DpoData2>
            </DpoInnerCard>
          </Link>
        </DpoWrapper>
      )}
    </>
  )
}

export function DpoProfileCard({ dpoIndex }: { dpoIndex: string }) {
  const dpoInfo = useSubDpo(dpoIndex)
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime, genesisTs } = useBlockManager()
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
      {dpoInfo && chainDecimals && expectedBlockTime && genesisTs && (
        <DpoWrapper style={{ overflow: 'hidden' }}>
          <Link to={`/item/dpo/${dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
            <DpoInnerCard>
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
            </DpoInnerCard>
          </Link>
        </DpoWrapper>
      )}
    </>
  )
}
