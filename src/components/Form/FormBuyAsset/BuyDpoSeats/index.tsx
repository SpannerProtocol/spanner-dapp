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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, DpoMemberInfo } from 'spanner-api/types'
import { Dispatcher } from 'types/dispatcher'
import { bnToUnitNumber, formatToUnit, unitToBnWithDecimal } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from 'utils/validAddress'
import { getDpoRemainingPurchase } from '../../../../utils/getDpoData'
import Decimal from 'decimal.js'
import { PrimaryMUISlider } from '../../../Slider'
import { BuyData } from '../index'
import { ErrorMsg } from '../../../../pages/Dex/components'
import { useQueryDpoMembers } from '../../../../hooks/useQueryDpoMembers'
import useWallet from '../../../../hooks/useWallet'

interface BuyDpoSeatsFormProps {
  dpoInfo: DpoInfo
  token: string
  onSubmit: (data: any) => void
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
  const [amount, setAmount] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { passengerSharePercentCap, passengerSharePercentMinimum } = useConsts()
  const balance = useSubscribeBalance(token)
  const [newReferrer, setNewReferrer] = useState<boolean>(false)
  const { chainDecimals } = useSubstrate()
  const [errMsg, setErrMsg] = useState<string>('')

  // const dpoTargetAmount = bnToUnitNumber(dpoInfo.target_amount, chainDecimals, 0, true).fixed())
  // const passengerShareCap = passengerSharePercentCap ? dpoTargetAmount * passengerSharePercentCap : 0
  // const passengerShareMinimum = passengerSharePercentMinimum ? dpoTargetAmount * passengerSharePercentMinimum : 0

  const dpoTargetAmountDecimal = new Decimal(bnToUnitNumber(dpoInfo.target_amount, chainDecimals))
  let passengerShareCap = passengerSharePercentCap ? dpoTargetAmountDecimal.mul(passengerSharePercentCap).toNumber() : 0
  let passengerShareMinimum = passengerSharePercentMinimum
    ? dpoTargetAmountDecimal.mul(passengerSharePercentMinimum).toNumber()
    : 0

  const remaining = bnToUnitNumber(getDpoRemainingPurchase(dpoInfo), chainDecimals)
  if (remaining < passengerShareMinimum) {
    passengerShareMinimum = remaining
  }
  if (remaining < passengerShareCap) {
    passengerShareCap = remaining
  }

  const dpoMembers = useQueryDpoMembers(dpoInfo.index.toString())
  const [userMemberInfo, setUserMemberInfo] = useState<DpoMemberInfo>()
  const wallet = useWallet()

  useEffect(() => {
    if (!wallet || !wallet.address || !dpoMembers || dpoMembers.length === 0) return
    const memberInfo = dpoMembers.find(
      (entry) => entry[1].buyer.isPassenger && entry[1].buyer.asPassenger.eq(wallet.address)
    )
    setUserMemberInfo(memberInfo ? memberInfo[1] : undefined)
  }, [dpoMembers, wallet])

  if (userMemberInfo) {
    const userPurchasedShares = bnToUnitNumber(userMemberInfo.share, chainDecimals)
    passengerShareCap = new Decimal(passengerShareCap).sub(userPurchasedShares).toNumber()
    if (passengerShareCap < passengerShareMinimum) {
      passengerShareMinimum = passengerShareCap
    }
  }

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
    if (!passengerSharePercentCap || !passengerSharePercentMinimum) return
    if (value > passengerShareCap) return
    setAmount(value)
  }

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({ amount: amount, referrer: validatedReferrer, newReferrer })
  }

  // if the user had a stored referrer, set it
  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  useEffect(() => {
    if (amount < passengerShareMinimum && amount > 0) {
      setErrMsg('Less than minimum')
    } else {
      setErrMsg('')
    }
  }, [amount, passengerShareMinimum])

  const handleSliderChange = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      handleSeats(newValue)
    }
  }
  return (
    <>
      <Section>
        <SText>{t(`Buy this DPO's Shares to contribute to their Crowdfunding Amount`)}</SText>
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
            <QuestionHelper text={t(`Amount of Shares left in DPO.`)} size={12} backgroundColor={'#fff'} />
          </RowFixed>
          <SText>
            {formatToUnit(getDpoRemainingPurchase(dpoInfo), chainDecimals, 2)} {token}
          </SText>
        </RowBetween>
        <RowBetween>
          <RowFixed width="fit-content">
            <SText>{t(`Total Purchased Price`)}</SText>
            <QuestionHelper
              text={t(`The total cost of Shares to buy from this DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <SText>
            {formatToUnit(dpoInfo.total_fund, chainDecimals, 2)} {token}
          </SText>
        </RowBetween>
      </BorderedWrapper>
      <Section>
        <RowFixed width="fit-content">
          <SText>
            {t(`Shares to Buy`)} ({token})
          </SText>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-seats"
          type="number"
          placeholder={`${passengerShareMinimum.toFixed(2)} - ${passengerShareCap.toFixed(2)}`}
          onChange={(e) => handleSeats(parseFloat(e.target.value))}
          value={Number.isNaN(amount) || !amount ? '' : amount.toString()}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
        {errMsg && <ErrorMsg>{t(errMsg)}</ErrorMsg>}
        <PrimaryMUISlider
          value={amount}
          onChange={handleSliderChange}
          aria-labelledby="continuous-slider"
          min={passengerShareMinimum}
          max={passengerShareCap}
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
        <ButtonPrimary onClick={handleSubmit} maxWidth="none" mobileMaxWidth="none" disabled={errMsg.length > 0}>
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
          deposit={buyData.amount ? buyData.amount.toFixed(2) : '0'}
          token={token}
          estimatedFee={txInfo.estimatedFee}
        />
      </TxModal>
    </>
  )
}
