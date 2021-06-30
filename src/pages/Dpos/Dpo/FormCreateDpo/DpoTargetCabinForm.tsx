import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider'
import QuestionHelper from 'components/QuestionHelper'
import Row, { RowAlignRight, RowBetween, RowFixed } from 'components/Row'
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
import { DpoFormCoreProps } from './index'
import { getCabinClassImage } from '../../../../utils/getCabinClass'
import {
  DpoBaseFeeHorizontal,
  DpoDirectReferralRateHorizontal,
  DpoEndHorizontal,
  DpoManagerSeatsHorizontal,
  DpoNameHorizontal,
  DpoReferralCodeHorizontal,
} from './fieldsHorizontal'
import { ColumnCenter } from '../../../../components/Column'

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
  const [dpoName, setDpoName] = useState<string>('')
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
  const [errNameTooShort, setErrNameTooShort] = useState<boolean>(false)

  const hasError = useMemo(() => errNoBalance || errNameTooShort, [errNoBalance, errNameTooShort])

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
    const name = event.target.value
    if (name.length <= 0) {
      setErrNameTooShort(true)
    } else {
      setErrNameTooShort(false)
    }
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

  const handleManagerSeats = (seats: string) => {
    const value = parseFloat(seats)
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
        {/*<SText>*/}
        {/*  {t(`Create DPO for TravelCabin`)}: {travelCabinInfo.name.toString()}*/}
        {/*</SText>*/}
      </Section>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`DPO Goal`)}</HeavyText>
          <Divider />
        </Section>
        <Section>
          <RowBetween>
            <RowFixed>
              <SText>{t(`Default Target`)}</SText>
              <QuestionHelper
                text={t(
                  `The Default Target is a goal that all members agree to pursue. When the DPO is ACTIVE, the Default Target must be selected if available.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <Row style={{ justifyContent: 'flex-end' }}>
              <div style={{ maxWidth: '30px', width: '30px' }}>
                {getCabinClassImage(travelCabinInfo.name.toString())}
              </div>
              <SText width={'fit-content'}>{`${t(`TravelCabin`)} ${travelCabinInfo.name.toString()}`}</SText>
            </Row>
          </RowBetween>
        </Section>
        <Section>
          <RowBetween>
            <RowFixed width="fit-content">
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
        </Section>
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`DPO Info`)}</HeavyText>
          <Divider />
        </Section>
        <DpoNameHorizontal onChange={handleDpoName} error={errNameTooShort} />
        <DpoEndHorizontal end={end} onChange={handleEnd} />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`Incentive Structure`)}</HeavyText>
          <Divider />
        </Section>
        <DpoBaseFeeHorizontal baseFee={baseFee} onChange={handleBaseFee} />
        <DpoManagerSeatsHorizontal
          dpoName={dpoName ? dpoName : ''}
          costPerSeat={costPerSeat}
          seatCap={passengerSeatCap}
          managerSeats={managerSeats}
          onChange={handleManagerSeats}
          token={token}
          errMsg={errNoBalance ? t(`Insufficient Balance`) : undefined}
        />
        <DpoDirectReferralRateHorizontal directReferralRate={directReferralRate} onChange={handleDirectReferralRate} />
        <Section>
          <BorderedWrapper>
            <RowBetween>
              <ColumnCenter>
                <RowFixed width="fit-content">
                  <SText>{t(`Management Fee`)}</SText>
                  <QuestionHelper
                    text={t(`Management Fee is charged on all yield releases`)}
                    size={10}
                    backgroundColor={'#fff'}
                  />
                </RowFixed>
                <SText>{`${noNan(baseFee + managerSeats)}%`}</SText>
                <SText>{`${noNan(baseFee)} (${t(`Base`)}) + ${noNan(managerSeats)} (${t(`Seats`)})`}</SText>
              </ColumnCenter>
              <ColumnCenter>
                <RowFixed width="fit-content">
                  <SText>{t(`Referral Rates`)} (%)</SText>
                  <QuestionHelper
                    text={t(`The rates for Direct Referrals and 2nd Degree Referrals.`)}
                    size={10}
                    backgroundColor={'#fff'}
                  />
                </RowFixed>
                <SText>{`${t(`Direct`)}: ${noNan(directReferralRate)} `}</SText>
                <SText>{`${t(`2nd`)}: ${noNan(100 - directReferralRate)} `}</SText>
              </ColumnCenter>
            </RowBetween>
          </BorderedWrapper>
        </Section>
      </SpacedSection>
      <SpacedSection>
        <DpoReferralCodeHorizontal
          newReferrer={newReferrer}
          referralCode={referralCode}
          onChange={handleReferralCode}
        />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <RowAlignRight>
            <SText width={'fit-content'} fontSize="10px">{`${t('Balance')}: ${formatToUnit(
              balance,
              chainDecimals,
              2
            )} ${token}`}</SText>
          </RowAlignRight>
        </Section>
        <Section>
          <RowBetween>
            <RowFixed width="fit-content">
              <HeavyText>{t(`Your Deposit`)}</HeavyText>
              <QuestionHelper
                text={t(`Your required deposit. Calculated by Crowdfund Amount / 100 * Manager Seats`)}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <HeavyText width={'fit-content'}>{`${formatToUnit(requiredDeposit, chainDecimals, 2)} ${token}`}</HeavyText>
          </RowBetween>
        </Section>
      </SpacedSection>

      <Section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <ButtonPrimary maxWidth="none" onClick={handleSubmit} disabled={hasError || dpoName.length <= 0}>
          {t(`Create DPO`)}
        </ButtonPrimary>
      </Section>
    </>
  )
}
