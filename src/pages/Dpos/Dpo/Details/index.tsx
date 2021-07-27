import BN from 'bn.js'
import Card from 'components/Card'
import { LinearProgressBar } from 'components/ProgressBar'
import { RowBetween } from 'components/Row'
import { Header2, SmallText, SText } from 'components/Text'
import { BorderedWrapper, ContentWrapper, Section } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useDpoFees from 'hooks/useDpoFees'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-api/types'
import { ThemeContext } from 'styled-components'
import { blocksToCountDown, blockToDays } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import getApy from 'utils/getApy'
import { getDpoMinimumPurchase, getDpoProgress } from '../../../../utils/getDpoData'

export default function Details({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  const { chainDecimals } = useSubstrate()
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const theme = useContext(ThemeContext)
  const fees = useDpoFees(dpoInfo.index.toString())
  const { t } = useTranslation()

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )
  const dirRefRate = useMemo(() => dpoInfo.direct_referral_rate.toNumber() / 10, [dpoInfo])
  const expiry = useMemo(() => {
    let expiryBlk = new BN(0)
    if (lastBlock) {
      expiryBlk = dpoInfo.expiry_blk.sub(lastBlock).isNeg() ? new BN(0) : dpoInfo.expiry_blk.sub(lastBlock)
    }
    return expiryBlk
  }, [dpoInfo, lastBlock])

  return (
    <>
      <ContentWrapper>
        <Card margin="0 0 1rem 0">
          <Header2>{t(`Details`)}</Header2>
          <SmallText>{t(`DPO Account Vault`)}</SmallText>
          <BorderedWrapper borderColor="#EC3D3D" margin="0 0 0.5rem 0">
            <Section>
              <RowBetween>
                <SText>{t(`Bonus`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.vault_bonus, chainDecimals, 2)} {token}
                </SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Yield`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {token}
                </SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Deposit`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.vault_deposit.toString(), chainDecimals, 2)} {token}
                </SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Withdraw`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.vault_withdraw.toString(), chainDecimals, 2)} {token}
                </SText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`General Information`)}</SmallText>
          <BorderedWrapper margin="0 0 0.5rem 0">
            <Section>
              <RowBetween>
                <SText>{t(`DPO Id`)}</SText>
                <SText>{dpoInfo.index.toString()}</SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`DPO Name`)}</SText>
                <SText>{dpoInfo.name}</SText>
              </RowBetween>
              {dpoInfo.state.isCreated && expiry && expectedBlockTime && (
                <RowBetween>
                  <SText>{t(`Crowdfunding Ends`)}</SText>
                  <SText>{blocksToCountDown(expiry, expectedBlockTime, t(`Expired`))}</SText>
                </RowBetween>
              )}
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Crowdfunding Information`)}</SmallText>
          <BorderedWrapper margin="0 0 0.5rem 0">
            <Section>
              <RowBetween>
                <SText>{t(`Target`)}</SText>
                {dpoInfo.target.isTravelCabin && (
                  <Link to={`/item/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`}>
                    <SText color={theme.blue2}>
                      {t(`TravelCabin`)} {dpoInfo.target.asTravelCabin.toString()}
                    </SText>
                  </Link>
                )}
                {dpoInfo.target.isDpo && (
                  <Link to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/activity`}>
                    <SText color={theme.blue2}>
                      {t(`DPO`)} {dpoInfo.target.asDpo[0].toString()}
                    </SText>
                  </Link>
                )}
              </RowBetween>
              {dpoInfo.target.isDpo && (
                <RowBetween>
                  <SText>{t(`Seats to Purchase`)}</SText>
                  <SText>{dpoInfo.target.asDpo[1].toString()}</SText>
                </RowBetween>
              )}
              <RowBetween>
                <SText>{t(`Amount`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals)} {token}
                </SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Cost Minimum Purchase`)}</SText>
                <SText>
                  {formatToUnit(getDpoMinimumPurchase(dpoInfo), chainDecimals)} {token}
                </SText>
              </RowBetween>
              {expectedBlockTime && (
                <RowBetween>
                  <SText>{t(`Maturity`)}</SText>
                  <SText>
                    {`${t(`Block`)} #${formatToUnit(dpoInfo.target_maturity.toString(), 0)} (${blockToDays(
                      dpoInfo.target_maturity,
                      expectedBlockTime,
                      2
                    )} ${t(`days`)})`}
                  </SText>
                </RowBetween>
              )}
              <RowBetween>
                <SText>{t(`Bonus`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.target_bonus_estimate.toString(), chainDecimals)} {token}
                </SText>
              </RowBetween>
              {expectedBlockTime && (
                <RowBetween>
                  <SText>{t(`Yield`)}</SText>
                  <SText>
                    {`${formatToUnit(dpoInfo.target_yield_estimate.toString(), chainDecimals)} ${token} (${getApy({
                      totalYield: dpoInfo.target_yield_estimate.toBn(),
                      totalDeposit: dpoInfo.target_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blockTime: expectedBlockTime,
                      maturity: dpoInfo.target_maturity,
                      precision: 2,
                    }).toString()}% APY)`}
                  </SText>
                </RowBetween>
              )}
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`State Information`)}</SmallText>
          <BorderedWrapper margin="0 0 0.5rem 0">
            <Section>
              <RowBetween>
                <SText>{t(`State`)}</SText>
                <SText>{t(dpoInfo.state.toString())}</SText>
              </RowBetween>
              {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) && (
                <RowBetween>
                  <SText>{t(`Crowdfund Period`)}</SText>
                  <SText>{t(`EXPIRED`)}</SText>
                </RowBetween>
              )}
            </Section>
            <Section>
              <RowBetween style={{ paddingBottom: '0.25rem' }}>
                <SText>{t(`Seats Filled`)}</SText>
                <SText>{`${getDpoProgress(dpoInfo)} / 100`}</SText>
              </RowBetween>
              <LinearProgressBar value={getDpoProgress(dpoInfo)} />
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Membership Requirements`)}</SmallText>
          <BorderedWrapper margin="0 0 0.5rem 0">
            <Section>
              {fees && (
                <RowBetween>
                  <SText>{t(`Management Fee`)}</SText>
                  <SText>{`${fees.base} (${t(`Base`)}) + ${fees.management} (${t(`Seats`)}) = ${
                    dpoInfo.fee.toNumber() / 10
                  }%`}</SText>
                </RowBetween>
              )}
              {dpoInfo.fee_slashed && (
                <RowBetween>
                  <SText>{t(`Manager Slashed`)}</SText>
                  <SText>{dpoInfo.fee_slashed.isTrue ? t(`Yes`) : t(`No`)}</SText>
                </RowBetween>
              )}
              <RowBetween>
                <SText>{t(`Cost Minimum Purchase`)}</SText>
                <SText>
                  {formatToUnit(getDpoMinimumPurchase(dpoInfo), chainDecimals, 2)} {token}
                </SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Direct Referral Rate`)}</SText>
                <SText>{`${dirRefRate} (${t(`Direct`)}) + ${100 - dirRefRate} (${t(`2nd`)}) = 100%`}</SText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
        </Card>
      </ContentWrapper>
    </>
  )
}
