import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary } from 'components/Button'
import { BorderedInput } from 'components/Input'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, Section } from 'components/Wrapper'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useReferrer } from 'hooks/useReferrer'
import { useSubstrate } from 'hooks/useSubstrate'
import { SubmitTxParams, TxInfo } from 'hooks/useTxHelpers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { Dispatcher } from 'types/dispatcher'
import { bnToUnit, formatToUnit, unitToBnWithDecimal } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from 'utils/validAddress'
import { getDpoRemainingPurchase } from '../../../../utils/getDpoData'
import Decimal from 'decimal.js'
import { PrimaryMUISlider } from '../../../Slider'

interface BuyDpoSeatsFormProps {
  dpoInfo: DpoInfo
  token: string
  onSubmit: (data: any) => void
}

interface BuyData {
  dpoIndex?: string
  amount?: BN
  referrer?: string | null
  newReferrer?: boolean
}

interface BuyDpoSeatsTxConfirmProps extends BuyData {
  deposit: string
  token: string
  estimatedFee?: string
}

interface TxConfirmProps {
  dpoInfo: DpoInfo
  token: string
  isOpen: boolean
  setIsOpen: Dispatcher<boolean>
  buyData: BuyData
  txInfo: TxInfo
  submitTx: (params: SubmitTxParams) => void
}

function BuyDpoSeatsTxConfirmContent({
  amount,
  deposit,
  estimatedFee,
  token,
  referrer,
  newReferrer,
}: BuyDpoSeatsTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <SText>{t(`Confirm the details below.`)}</SText>
      </Section>
      <BorderedWrapper>
        {/*<RowBetween>*/}
        {/*  <SText>{t(`Shares`)}</SText>*/}
        {/*  <SText>{targetSeats}</SText>*/}
        {/*</RowBetween>*/}
        <RowBetween>
          <SText>{t(`Deposit`)}</SText>
          <SText>
            {deposit} {token}
          </SText>
        </RowBetween>
        {newReferrer && referrer && (
          <RowBetween>
            <SText>{t(`Referral Code`)}</SText>
            <SText>{shortenAddr(referrer, 5)}</SText>
          </RowBetween>
        )}
      </BorderedWrapper>
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

export default function BuyDpoSeatsForm({ dpoInfo, token, onSubmit }: BuyDpoSeatsFormProps) {
  const [seats, setSeats] = useState<BN>(new BN(0))
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { passengerSharePercentCap, passengerSharePercentMinimum } = useConsts()
  const balance = useSubscribeBalance(token)
  const [newReferrer, setNewReferrer] = useState<boolean>(false)
  const { chainDecimals } = useSubstrate()

  // const dpoTargetAmount = parseFloat(bnToUnit(dpoInfo.target_amount, chainDecimals, 0, true).fixed())
  // const passengerShareCap = passengerSharePercentCap ? dpoTargetAmount * passengerSharePercentCap : 0
  // const passengerShareMinimum = passengerSharePercentMinimum ? dpoTargetAmount * passengerSharePercentMinimum : 0

  const passengerShareCap = passengerSharePercentCap
    ? new BN(new Decimal(dpoInfo.target_amount.toNumber()).mul(passengerSharePercentCap).toString())
    : new BN(0)
  const passengerShareMinimum = passengerSharePercentMinimum
    ? new BN(new Decimal(dpoInfo.target_amount.toNumber()).mul(passengerSharePercentMinimum).toString())
    : new BN(0)

  // useEffect(() => {
  //   if (!passengerSharePercentMinimum) return
  //   setSeats(passengerShareMinimum)
  // }, [passengerSharePercentMinimum])

  // This is only onChange
  const handleReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value.length === 0) {
      setReferralCode(null)
    } else {
      setReferralCode(value)
      setNewReferrer(true)
    }
  }

  const handleSeats = (value: number) => {
    const valueBN = Number.isNaN(value) ? new BN(0) : unitToBnWithDecimal(value, chainDecimals)
    if (!passengerSharePercentCap || !passengerSharePercentMinimum) return
    if (valueBN.gt(passengerShareCap)) return
    setSeats(valueBN)
  }

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({ amount: seats, referrer: validatedReferrer, newReferrer })
  }

  // if the user had a stored referrer, set it
  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  const handleSliderChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      handleSeats(newValue)
    }
  }
  const buyShares = parseFloat(formatToUnit(seats, chainDecimals, 2))
  return (
    <>
      <Section>
        <SText>{t(`Buy this DPO's Seats to contribute to their Crowdfunding Amount`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`Balance`)}</SText>
          <SText>
            {formatToUnit(balance, chainDecimals, 2)} {token}
          </SText>
        </RowBetween>
        <RowBetween>
          <RowFixed width="fit-content">
            <SText>{t(`Remaining Purchase`)}</SText>
            <QuestionHelper
              text={t(`Amount of Seats left in DPO. There are 100 seats per DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <SText>{formatToUnit(getDpoRemainingPurchase(dpoInfo), chainDecimals, 2)}</SText>
        </RowBetween>
        <RowBetween>
          <RowFixed width="fit-content">
            <SText>{t(`Total Purchased Price`)}</SText>
            <QuestionHelper
              text={t(`The total cost of Seats to buy from this DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <SText>
            {formatToUnit(dpoInfo.vault_deposit, chainDecimals, 2)} {token}
          </SText>
        </RowBetween>
      </BorderedWrapper>
      <Section>
        <RowFixed width="fit-content">
          <SText>
            {t(`Shares to Buy`)} ({token})
          </SText>
          <QuestionHelper
            text={t(
              `The # of Seats you wish to buy from this DPO will determine the crowdfunding target of your new DPO. The crowdfunding target will be split equally to 100 seats in your DPO.`
            )}
            size={12}
            backgroundColor={'#fff'}
          />
        </RowFixed>
        <BorderedInput
          required
          id="dpo-seats"
          type="number"
          placeholder={`${formatToUnit(passengerShareMinimum, chainDecimals, 2)} - ${formatToUnit(
            passengerShareCap,
            chainDecimals,
            2
          )}`}
          onChange={(e) => handleSeats(parseFloat(e.target.value))}
          value={Number.isNaN(buyShares) ? '' : buyShares}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
        <PrimaryMUISlider
          value={parseFloat(bnToUnit(seats, chainDecimals, 0, true))}
          onChange={handleSliderChange}
          aria-labelledby="continuous-slider"
          min={parseFloat(formatToUnit(passengerShareMinimum, chainDecimals, 2))}
          max={parseFloat(formatToUnit(passengerShareCap, chainDecimals, 2))}
          step={0.01}
        />
      </Section>
      {(!referralCode || newReferrer) && (
        <Section>
          <RowFixed width="fit-content">
            <SText>{t(`Referral Code`)}</SText>
            <QuestionHelper
              text={t(
                `Referral Codes are permanent and unique for each project on Spanner. If you arrived to Spanner Dapp via a Referral Link then the that Referral Code will be used.`
              )}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="e.g. 5F3A9CA..."
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        </Section>
      )}
      <Section style={{ marginTop: '1rem' }}>
        <ButtonPrimary onClick={handleSubmit} maxWidth="none" mobileMaxWidth="none">
          {t(`Buy`)}
        </ButtonPrimary>
      </Section>
    </>
  )
}

/**
 * Form Wrapper for PassengerBuyDpoSeats
 * Manages Form and Tx Confirmation
 */
export function BuyDpoSeatsTxConfirm({ dpoInfo, token, isOpen, setIsOpen, buyData, txInfo, submitTx }: TxConfirmProps) {
  const { t } = useTranslation()
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { chainDecimals } = useSubstrate()

  const dismissModal = () => {
    setIsOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  return (
    <>
      <TxModal
        isOpen={isOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Buy DPO Shares`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <BuyDpoSeatsTxConfirmContent
          {...buyData}
          deposit={formatToUnit(buyData.amount ? buyData.amount : new BN(0), chainDecimals, 2)}
          token={token}
          estimatedFee={txInfo.estimatedFee}
        />
      </TxModal>
    </>
  )
}
