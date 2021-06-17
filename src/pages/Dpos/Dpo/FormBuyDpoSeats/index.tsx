import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import { BorderedInput } from 'components/Input'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import { BorderedWrapper, Section } from 'components/Wrapper'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useReferrer } from 'hooks/useReferrer'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'
import { isValidSpannerAddress } from 'utils/validAddress'
import { DpoInfo } from 'spanner-interfaces'

interface BuyDpoSeatsFormProps {
  dpoInfo: DpoInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

export default function FormBuyDpoSeats({ dpoInfo, token, chainDecimals, onSubmit }: BuyDpoSeatsFormProps) {
  const [seats, setSeats] = useState<number>(1)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { passengerSeatCap } = useConsts()
  const balance = useSubscribeBalance(token)
  const [newReferrer, setNewReferrer] = useState<boolean>(false)

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

  const handleSeats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (!passengerSeatCap) return
    if (value < 1 || value > passengerSeatCap) return
    setSeats(value)
  }

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({ seats, referrer: validatedReferrer, newReferrer })
  }

  // if the user had a stored referrer, set it
  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

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
            <SText>{t(`Remaining Seats`)}</SText>
            <QuestionHelper
              text={t(`Amount of Seats left in DPO. There are 100 seats per DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <SText>{dpoInfo.empty_seats.toString()}</SText>
        </RowBetween>
        <RowBetween>
          <RowFixed width="fit-content">
            <SText>{t(`Total Seat Price`)}</SText>
            <QuestionHelper
              text={t(`The total cost of Seats to buy from this DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            />
          </RowFixed>
          <SText>
            {formatToUnit(new BN(seats).mul(dpoInfo.amount_per_seat), chainDecimals, 2)} {token}
          </SText>
        </RowBetween>
      </BorderedWrapper>
      <Section>
        <RowFixed width="fit-content">
          <SText>{t(`Seats to Buy`)}</SText>
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
          placeholder={`1 - ${passengerSeatCap}`}
          onChange={(e) => handleSeats(e)}
          value={Number.isNaN(seats) ? '' : seats}
          style={{ alignItems: 'flex-end', width: '100%' }}
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
        <ButtonPrimary onClick={handleSubmit}>{t(`Buy`)}</ButtonPrimary>
      </Section>
    </>
  )
}
