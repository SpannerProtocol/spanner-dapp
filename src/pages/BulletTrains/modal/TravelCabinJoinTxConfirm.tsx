import { useTranslation } from 'react-i18next'
import { BorderedWrapper, Section } from '../../../components/Wrapper'
import { SText } from '../../../components/Text'
import { RowBetween } from '../../../components/Row'
import Balance from '../../../components/Balance'
import TxFee from '../../../components/TxFee'
import React from 'react'

interface TravelCabinJoinTxConfirmProps {
  deposit: string
  token: string
  estimatedFee?: string
}

export function TravelCabinJoinTxConfirm({ deposit, token, estimatedFee }: TravelCabinJoinTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <SText>{t(`Buy this TravelCabin to start earning Rewards`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText width={'fit-content'}>{t(`Ticket Fare (deposit)`)}</SText>
          <SText width={'fit-content'}>
            {deposit} {token}
          </SText>
        </RowBetween>
      </BorderedWrapper>
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}
