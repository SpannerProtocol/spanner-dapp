import { useTranslation } from 'react-i18next'
import { useBlockManager } from '../../../hooks/useBlocks'
import { useSubstrate } from '../../../hooks/useSubstrate'
import { blockToDays } from '../../../utils/formatBlocks'
import BN from 'bn.js'
import { BorderedWrapper, Section } from '../../../components/Wrapper'
import { HeavyText, SText } from '../../../components/Text'
import { RowBetween } from '../../../components/Row'
import { formatToUnit } from '../../../utils/formatUnit'
import Divider from '../../../components/Divider'
import { shortenAddr } from '../../../utils/truncateString'
import Balance from '../../../components/Balance'
import TxFee from '../../../components/TxFee'
import React from 'react'

interface TravelCabinCrowdfundTxConfirmProps {
  target?: string
  targetAmount?: string
  dpoName?: string
  managerSeats?: string
  baseFee?: string
  directReferralRate?: string
  end?: string
  referrer?: string | null
  newReferrer?: boolean
  token?: string
  estimatedFee?: string
}

export function TravelCabinCrowdfundTxConfirm({
  target,
  targetAmount,
  dpoName,
  managerSeats,
  baseFee,
  directReferralRate,
  end,
  token,
  estimatedFee,
  referrer,
  newReferrer,
}: TravelCabinCrowdfundTxConfirmProps) {
  const { t } = useTranslation()
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const { chainDecimals } = useSubstrate()

  const endInDays =
    end && expectedBlockTime && lastBlock
      ? Math.ceil(parseFloat(blockToDays(new BN(end).sub(lastBlock), expectedBlockTime, 4)))
      : undefined

  return (
    <>
      <Section>
        <SText>{t(`Verify DPO details`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`Default Target`)}</SText>
          <SText>{target}</SText>
        </RowBetween>
        <RowBetween>
          <SText>{t(`DPO Name`)}</SText>
          <SText>{dpoName}</SText>
        </RowBetween>
        {targetAmount && (
          <RowBetween>
            <SText>{t(`Crowdfunding Amount`)}</SText>
            <SText>
              {formatToUnit(targetAmount, chainDecimals, 2)} {token}
            </SText>
          </RowBetween>
        )}
        {end && endInDays && (
          <RowBetween>
            <SText>{t(`Crowdfunding Period`)}</SText>
            <SText fontSize="12px">{`~${t(`Block`)} #${end} (${endInDays} ${t(`days`)})`}</SText>
          </RowBetween>
        )}
        {managerSeats && baseFee && (
          <RowBetween>
            <SText>{t(`Management Fee`)}</SText>
            <SText>
              {`${baseFee} (${t(`Base`)}) + ${managerSeats} (${t(`Seats`)}) = ${Math.round(
                parseFloat(managerSeats) + parseFloat(baseFee)
              ).toString()}%`}
            </SText>
          </RowBetween>
        )}
        {directReferralRate && (
          <RowBetween>
            <SText>{t(`Direct Referral Rate`)}</SText>
            <SText>
              {`${parseInt(directReferralRate)} (${t(`Direct`)}) + ${100 - parseInt(directReferralRate)} (${t(
                `2nd`
              )}) = 100%`}
            </SText>
          </RowBetween>
        )}
        <Divider />
        {managerSeats && targetAmount && (
          <RowBetween>
            <HeavyText fontSize="14px">{t(`Required Deposit`)}</HeavyText>
            <HeavyText fontSize="14px">
              {`${formatToUnit(new BN(managerSeats).mul(new BN(targetAmount).div(new BN(100))), chainDecimals, 2)} 
              ${token}`}
            </HeavyText>
          </RowBetween>
        )}
      </BorderedWrapper>
      {newReferrer && referrer && (
        <BorderedWrapper>
          <RowBetween>
            <SText>{t(`Referral Code`)}</SText>
            <SText>{shortenAddr(referrer, 5)}</SText>
          </RowBetween>
        </BorderedWrapper>
      )}
      {token && <Balance token={token} />}
      <TxFee fee={estimatedFee} />
    </>
  )
}
