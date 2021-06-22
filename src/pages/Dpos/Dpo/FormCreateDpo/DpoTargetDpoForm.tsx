import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import { BorderedWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useReferrer } from 'hooks/useReferrer'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { blockToDays } from 'utils/formatBlocks'
import { abs, noNan } from 'utils/formatNumbers'
import { formatToUnit } from 'utils/formatUnit'
import { isValidSpannerAddress } from 'utils/validAddress'
import {
  DpoReferralCode,
  DpoDefaultTarget,
  DpoName,
  DpoEnd,
  DpoTargetDpoSeats,
  DpoManagerSeats,
  DpoBaseFee,
  DpoDirectReferralRate,
} from './fields'
import { DpoFormCoreProps } from './index'

interface DpoTargetDpoFormProps extends DpoFormCoreProps {
  dpoInfo: DpoInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

export default function DpoTargetDpoForm({ dpoInfo, token, chainDecimals, onSubmit }: DpoTargetDpoFormProps) {
  const [seats, setSeats] = useState<number>(1)
  const [managerSeats, setManagerSeats] = useState<number>(0)
  const [baseFee, setBaseFee] = useState<number>(0)
  const { passengerSeatCap, dpoSeatCap } = useConsts()
  const [directReferralRate, setDirectReferralRate] = useState<number>(70)
  const [dpoName, setDpoName] = useState<string | null>('')
  const [end, setEnd] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const [newReferrer, setNewReferrer] = useState<boolean>(false)
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const balance = useSubscribeBalance(token.toUpperCase())
  const [errNoBalance, setErrNoBalance] = useState<boolean>(false)

  // Subtracting 500 blocks to give buffer if the user idles on the form
  const maxEnd =
    expectedBlockTime &&
    lastBlock &&
    blockToDays(dpoInfo.expiry_blk.sub(lastBlock).sub(new BN(500)), expectedBlockTime, 2)

  const costPerSeat = useMemo(() => new BN(seats).mul(dpoInfo.amount_per_seat).div(new BN(100)), [dpoInfo, seats])

  const handleDpoName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDpoName(event.target.value)
  }

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
    if (!dpoSeatCap) return
    if (value < 1 || value > dpoSeatCap) return
    setSeats(abs(value))
  }

  const handleDirectReferralRate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value > 100) return
    setDirectReferralRate(abs(value))
  }

  const handleBaseFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value > 5) return
    setBaseFee(abs(value))
  }

  const handleManagerSeats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (!passengerSeatCap) return
    if (value > passengerSeatCap) return
    setManagerSeats(abs(value))
  }

  const handleEnd = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value)
      if (maxEnd && value > parseFloat(maxEnd)) return
      setEnd(value)
    },
    [maxEnd]
  )

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({
      dpoName,
      seats: Number.isNaN(seats) ? 1 : seats,
      managerSeats: Number.isNaN(managerSeats) ? 0 : managerSeats,
      baseFee: Number.isNaN(baseFee) ? 0 : baseFee,
      directReferralRate: Number.isNaN(directReferralRate) ? 0 : directReferralRate,
      end: Number.isNaN(end) ? 1 : end,
      referrer: validatedReferrer,
      newReferrer: newReferrer,
    })
  }

  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  const requiredDeposit = useMemo(
    () => new BN(managerSeats).mul(new BN(seats).mul(dpoInfo.amount_per_seat).div(new BN(100))),
    [dpoInfo, managerSeats, seats]
  )

  useEffect(() => {
    if (balance.lt(requiredDeposit)) {
      setErrNoBalance(true)
    } else {
      setErrNoBalance(false)
    }
  }, [seats, balance, dpoInfo, managerSeats, requiredDeposit])

  return (
    <>
      <Section>
        <SText>
          {t(`Create DPO for DPO`)}: {dpoInfo.name.toString()}
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
            <RowFixed width="fit-content">
              <SText>{t(`Crowdfund Amount`)}</SText>
              <QuestionHelper
                text={t(`The number of seats to buy from your Target DPO.`)}
                size={10}
                backgroundColor={'#fff'}
              ></QuestionHelper>
            </RowFixed>
            <SText>
              {formatToUnit(new BN(seats).mul(dpoInfo.amount_per_seat), chainDecimals, 2)} {token}
            </SText>
          </RowBetween>
          <RowBetween>
            <RowFixed width="fit-content">
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
        <DpoDefaultTarget target={dpoInfo.name.toString()} />
        <DpoName onChange={handleDpoName} />
        <DpoEnd end={end} maxEnd={maxEnd} onChange={handleEnd} />
        <DpoTargetDpoSeats
          seats={seats}
          emptySeats={dpoInfo.empty_seats.toString()}
          seatCap={dpoSeatCap}
          targetDpoName={dpoInfo.name.toString()}
          onChange={handleSeats}
        />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`Incentive Structure`)}</HeavyText>
          <Divider />
        </Section>
        <BorderedWrapper>
          <RowBetween>
            <RowFixed width="fit-content">
              <SText>{t(`Management Fee`)}</SText>
              <QuestionHelper
                text={t(`Management Fee is charged on all yield releases`)}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <SText>{`${noNan(baseFee)} (${t(`Base`)}) + ${noNan(managerSeats)} (${t(`Seats`)}) = ${noNan(
              baseFee + managerSeats
            )}%`}</SText>
          </RowBetween>
          <RowBetween>
            <RowFixed width="fit-content">
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
        <DpoBaseFee baseFee={baseFee} onChange={handleBaseFee} />
        <DpoManagerSeats
          seatCap={passengerSeatCap}
          managerSeats={managerSeats}
          dpoName={dpoName ? dpoName : ''}
          costPerSeat={costPerSeat}
          token={token}
          onChange={handleManagerSeats}
          errMsg={errNoBalance ? t(`Insufficient Balance`) : undefined}
        />
        <DpoDirectReferralRate directReferralRate={directReferralRate} onChange={handleDirectReferralRate} />
      </SpacedSection>
      <SpacedSection>
        <DpoReferralCode newReferrer={newReferrer} referralCode={referralCode} onChange={handleReferralCode} />
      </SpacedSection>
      <Section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <ButtonPrimary maxWidth="none" onClick={handleSubmit} disabled={errNoBalance ? true : false}>
          {t(`Create DPO`)}
        </ButtonPrimary>
      </Section>
    </>
  )
}
