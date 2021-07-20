import Balance from 'components/Balance'
import { ButtonPrimary } from 'components/Button'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import { SubmitTxParams } from 'hooks/useTxHelpers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TravelCabinInfo } from 'spanner-api/types'
import { Dispatcher } from 'types/dispatcher'
import { formatToUnit } from 'utils/formatUnit'

/**
 * This form should also be used as the TxConfirmation since no inputs are
 * required from the user
 */
export default function BuyTravelCabinForm({
  travelCabinInfo,
  token,
  estimatedFee,
  setIsOpen,
  onRender,
  submitTx,
}: {
  travelCabinInfo: TravelCabinInfo
  token: string
  estimatedFee?: string
  setIsOpen: Dispatcher<boolean>
  onRender: () => void
  submitTx: (params: SubmitTxParams) => void
}) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  // don't need the variables because we're not using txmodal, just need the dispatchers
  const [, setTxHash] = useState<string | undefined>()
  const [, setTxPendingMsg] = useState<string | undefined>()
  const [, setTxErrorMsg] = useState<string | undefined>()

  const dismissModal = () => {
    setIsOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const totalDeposit = formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)

  // Tx should be created on render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onRender(), [])

  return (
    <>
      <SpacedSection>
        <SText>{t(`Buy this TravelCabin to start earning Rewards`)}</SText>
      </SpacedSection>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`TravelCabin`)}</SText>
          <SText>{t(travelCabinInfo.name.toString())}</SText>
        </RowBetween>
        <RowBetween>
          <SText>{t(`Total Deposit`)}</SText>
          <SText>{`${totalDeposit} ${token}`}</SText>
        </RowBetween>
      </BorderedWrapper>
      <SpacedSection>
        <Balance token={token} />
        <TxFee fee={estimatedFee} />
      </SpacedSection>
      <SpacedSection>
        <ButtonPrimary
          onClick={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
          maxWidth="none"
          mobileMaxWidth="none"
        >
          {t(`Buy`)}
        </ButtonPrimary>
      </SpacedSection>
    </>
  )
}
