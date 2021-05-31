import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import { BorderedWrapper, Section, SpacedSection } from 'components/Wrapper'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useReferrer } from 'hooks/useReferrer'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TravelCabinInfo } from 'spanner-interfaces'
import { noNan } from 'utils/formatNumbers'
import { formatToUnit } from 'utils/formatUnit'
import { isValidSpannerAddress } from 'utils/validAddress'
import {
  DpoBaseFee,
  DpoDefaultTarget,
  DpoDirectReferralRate,
  DpoEnd,
  DpoManagerSeats,
  DpoName,
  DpoReferralCode,
} from './fields'
import { DpoFormCoreProps } from './index'

interface DpoTargetCabinFormProps extends DpoFormCoreProps {
  travelCabinInfo: TravelCabinInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

export default function DpoTargetCabinForm({
  travelCabinInfo,
  token,
  chainDecimals,
  onSubmit,
}: DpoTargetCabinFormProps) {
  const [managerSeats, setManagerSeats] = useState<number>(0)
  const [dpoName, setDpoName] = useState<string | null>('')
  const [baseFee, setBaseFee] = useState<number>(0)
  const [directReferralRate, setDirectReferralRate] = useState<number>(70)
  const [end, setEnd] = useState<number>(30)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const [newReferrer, setNewReferrer] = useState<boolean>(false)
  const { t } = useTranslation()
  const { passengerSeatCap } = useConsts()
  const balance = useSubscribeBalance(token.toUpperCase())
  const [errNoBalance, setErrNoBalance] = useState<boolean>(false)

  const costPerSeat = useMemo(() => travelCabinInfo.deposit_amount.div(new BN(100)), [travelCabinInfo])

  const handleReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value.length === 0) {
      setReferralCode(null)
    } else {
      setReferralCode(value)
      setNewReferrer(true)
    }
  }

  const handleDpoName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDpoName(event.target.value)
  }

  const handleDirectReferralRate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value > 100) return
    setDirectReferralRate(value)
  }

  const handleBaseFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value > 5) return
    setBaseFee(value)
  }

  const handleManagerSeats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value > 15) return
    setManagerSeats(value)
  }

  const handleEnd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setEnd(parseInt(value))
  }

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({
      managerSeats: Number.isNaN(managerSeats) ? 0 : managerSeats,
      baseFee: Number.isNaN(baseFee) ? 0 : baseFee,
      directReferralRate: Number.isNaN(directReferralRate) ? 0 : directReferralRate,
      end: Number.isNaN(end) ? 1 : end,
      dpoName,
      referrer: validatedReferrer,
      newReferrer,
    })
  }

  useEffect(() => {
    if (!referralCode && referrer) {
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  const requiredDeposit = useMemo(() => new BN(managerSeats).mul(travelCabinInfo.deposit_amount.div(new BN(100))), [
    travelCabinInfo,
    managerSeats,
  ])

  useEffect(() => {
    if (balance.lt(requiredDeposit)) {
      setErrNoBalance(true)
    } else {
      setErrNoBalance(false)
    }
  }, [balance, travelCabinInfo, managerSeats, requiredDeposit])

  return (
    <>
      <Section>
        <SText>
          {t(`Create DPO for TravelCabin`)}: {travelCabinInfo.name.toString()}
        </SText>
      </Section>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`DPO Goal`)}</HeavyText>
          <Divider />
        </Section>
        <BorderedWrapper>
          <RowBetween>
            <SText>{t(`Available Balance`)}</SText>
            <SText>
              {formatToUnit(balance, chainDecimals, 2)} {token}
            </SText>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <SText>{t(`Crowdfund Amount`)}</SText>
              <QuestionHelper
                text={t(`The number of seats to buy from your Target DPO.`)}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <SText>
              {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)} {token}
            </SText>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <SText>{t(`Your Deposit`)}</SText>
              <QuestionHelper
                text={t(`Your required deposit. Calculated by Crowdfund Amount / 100 * Manager Seats`)}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <SText>{`${formatToUnit(requiredDeposit, chainDecimals, 2)} ${token}`}</SText>
          </RowBetween>
        </BorderedWrapper>
        <DpoDefaultTarget target={travelCabinInfo.name.toString()} />
        <DpoName onChange={handleDpoName} />
        <DpoEnd end={end} onChange={handleEnd} />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`Incentive Structure`)}</HeavyText>
          <Divider />
        </Section>
      </SpacedSection>
      <BorderedWrapper>
        <RowBetween>
          <RowFixed>
            <SText>{t(`Management Fee`)}</SText>
            <QuestionHelper
              text={t(`Management Fee is charged on all yield releases`)}
              size={10}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <SText>{`${noNan(baseFee)} (${t(`Base`)}) + ${noNan(managerSeats)} (${t(`Seats`)}) = ${noNan(
            baseFee + managerSeats
          )}%`}</SText>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <SText>{t(`Referral Rates`)} (%)</SText>
            <QuestionHelper
              text={t(`The rates for Direct Referrals and 2nd Degree Referrals.`)}
              size={10}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <SText>{`${noNan(directReferralRate)} (${t(`Direct`)}) + ${noNan(100 - directReferralRate)} (${t(
            `2nd`
          )}) = 100%`}</SText>
        </RowBetween>
      </BorderedWrapper>
      <DpoManagerSeats
        dpoName={dpoName ? dpoName : ''}
        costPerSeat={costPerSeat}
        seatCap={passengerSeatCap}
        managerSeats={managerSeats}
        onChange={handleManagerSeats}
        token={token}
        errMsg={errNoBalance ? t(`Insufficient Balance`) : undefined}
      />
      <DpoBaseFee baseFee={baseFee} onChange={handleBaseFee} />
      <DpoDirectReferralRate directReferralRate={directReferralRate} onChange={handleDirectReferralRate} />
      <SpacedSection>
        <DpoReferralCode newReferrer={newReferrer} referralCode={referralCode} onChange={handleReferralCode} />
      </SpacedSection>
      <Section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <ButtonPrimary onClick={handleSubmit}>{t(`Create DPO`)}</ButtonPrimary>
      </Section>
    </>
  )
}
