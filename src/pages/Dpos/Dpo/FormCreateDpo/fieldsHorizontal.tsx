import BN from 'bn.js'
import { useTranslation } from 'react-i18next'
import { useSubstrate } from '../../../../hooks/useSubstrate'
import useSubscribeBalance from '../../../../hooks/useQueryBalance'
import React, { useCallback, useContext } from 'react'
import { BorderedWrapper, Section } from '../../../../components/Wrapper'
import Row, { RowBetween, RowFixed } from '../../../../components/Row'
import { SText } from '../../../../components/Text'
import { formatToUnit } from '../../../../utils/formatUnit'
import QuestionHelper from '../../../../components/QuestionHelper'
import { BorderedInput, SInput } from '../../../../components/Input'
import { PillButton } from '../../../../components/Button'
import { ErrorMsg } from '../../../Dex/components'
import { ThemeContext } from 'styled-components'
import { ColumnCenter } from '../../../../components/Column'

export function DpoNameHorizontal({
  onChange,
  error,
}: {
  error: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  return (
    <Section>
      <RowBetween>
        <RowFixed>
          <SText mobileFontSize="10px">{t(`Name your DPO`)}</SText>
          <QuestionHelper
            text={t(`Name your DPO community to make it easier for others to search for you.`)}
            size={10}
            backgroundColor={'#fff'}
          />
        </RowFixed>
        <ColumnCenter>
          <BorderedInput
            required
            id="dpo-name"
            type="string"
            placeholder="Name"
            onChange={(e) => onChange(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
          {error && (
            <SText color={theme.red1} mobileFontSize="10px">
              {t(`Name cannot be empty`)}
            </SText>
          )}
        </ColumnCenter>
      </RowBetween>
    </Section>
  )
}

export function DpoEndHorizontal({
  end,
  maxEnd,
  onChange,
}: {
  end: number
  maxEnd?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <Section>
      <Row justifyContent="flex-end">
        {maxEnd && <SText mobileFontSize="10px">{`${t(`Max`)}: ${parseFloat(maxEnd) > 0 ? maxEnd : '0'}`}</SText>}
      </Row>
      <RowBetween>
        <RowFixed>
          <SText mobileFontSize="10px">
            {t(`Crowdfund Period`)} ({t(`Days`)})
          </SText>
          <QuestionHelper
            text={t(`Number of days to raise funds. When time is up, anyone can close this DPO.`)}
            size={10}
            backgroundColor={'transparent'}
          />
        </RowFixed>
        <ColumnCenter>
          <BorderedInput
            required
            id="dpo-end"
            type="number"
            placeholder="30"
            onChange={(e) => onChange(e)}
            value={Number.isNaN(end) ? '' : end}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        </ColumnCenter>
      </RowBetween>
    </Section>
  )
}

export function DpoBaseFeeHorizontal({
  baseFee,
  onChange,
}: {
  baseFee: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <Section>
      <RowBetween>
        <RowFixed>
          <SText mobileFontSize="10px">{t(`Base Fee`)} (%)</SText>
          <QuestionHelper
            text={t(`The base fee of your management fee (in %). Manager Fee = Base Fee + Manager Seats.`)}
            size={10}
            backgroundColor={'#fff'}
          />
        </RowFixed>
        <ColumnCenter>
          <BorderedInput
            required
            id="dpo-base-fee"
            type="number"
            placeholder="0 - 5"
            onChange={(e) => onChange(e)}
            value={Number.isNaN(baseFee) ? '' : baseFee}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        </ColumnCenter>
      </RowBetween>
    </Section>
  )
}

export function DpoManagerSeatsHorizontal({
  dpoName,
  managerSeats,
  seatCap,
  costPerSeat,
  token,
  errMsg,
  onChange,
}: {
  seatCap?: number
  managerSeats: number
  dpoName: string
  costPerSeat: BN
  token: string
  onChange: (seats: string) => void
  errMsg?: string
}) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const balance = useSubscribeBalance(token)

  const handleMax = useCallback(() => {
    if (!seatCap) return
    const seatCapBn = new BN(seatCap)
    const affordableSeats = balance.div(costPerSeat)
    if (affordableSeats.gt(seatCapBn)) {
      onChange(seatCapBn.toString())
    } else {
      const seats = Math.floor(affordableSeats.toNumber()).toString()
      onChange(seats)
    }
  }, [balance, costPerSeat, onChange, seatCap])

  return (
    <>
      {seatCap && (
        <Section>
          <Row justifyContent="flex-end">
            <SText mobileFontSize="10px" fontSize="10px" width={'fit-content'}>
              {t(`Seat Cost`)}: {formatToUnit(costPerSeat, chainDecimals)} {token}
            </SText>
          </Row>
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{`${t(`Manager Seats in`)}: ${dpoName}`}</SText>
              <QuestionHelper
                text={t(
                  `# of Seats to buy as Manager from your new DPO. This is your Management Fee (%) on Member's yields.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <ColumnCenter>
              <BorderedWrapper margin="0" padding="0.25rem">
                <RowFixed margin="0" padding="0">
                  <SInput
                    required
                    id="dpo-manager-seats"
                    type="number"
                    placeholder={`0 - ${seatCap}`}
                    onChange={(e) => onChange(e.target.value)}
                    value={Number.isNaN(managerSeats) ? '' : managerSeats}
                    style={{ alignItems: 'flex-end', width: '100%' }}
                  />
                  <PillButton
                    onClick={handleMax}
                    padding="0.25rem"
                    mobilePadding="0.25rem"
                    margin="0 1rem"
                    minWidth="60px"
                    mobileMinWidth="60px"
                  >
                    {t(`Max`)}
                  </PillButton>
                </RowFixed>
              </BorderedWrapper>
              {errMsg && <ErrorMsg>{errMsg}</ErrorMsg>}
            </ColumnCenter>
          </RowBetween>
        </Section>
      )}
    </>
  )
}

export function DpoDirectReferralRateHorizontal({
  directReferralRate,
  onChange,
}: {
  directReferralRate: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <Section>
      <RowBetween>
        <RowFixed>
          <SText mobileFontSize="10px">{t(`Direct Referral Rate`)} (%)</SText>
          <QuestionHelper
            text={t(`The Referral Bonus (%) given to the Direct Referrer of an Internal Member to this DPO.`)}
            size={10}
            backgroundColor={'#fff'}
          />
        </RowFixed>
        <ColumnCenter>
          <BorderedInput
            required
            id="dpo-direct-referral-rate"
            type="number"
            placeholder="0 - 100"
            onChange={(e) => onChange(e)}
            value={Number.isNaN(directReferralRate) ? '' : directReferralRate}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        </ColumnCenter>
      </RowBetween>
    </Section>
  )
}

export function DpoReferralCodeHorizontal({
  referralCode,
  newReferrer,
  onChange,
}: {
  referralCode?: string | null
  newReferrer?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <>
      {(!referralCode || newReferrer) && (
        <Section>
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{t(`Referral Code`)}</SText>
              <QuestionHelper
                text={t(
                  `Referral Codes are permanent and unique for each project on Spanner. If you arrived to Spanner Dapp via a Referral Link then the that Referral Code will be used.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <ColumnCenter>
              <BorderedInput
                required
                id="dpo-referrer"
                type="string"
                placeholder="A3FDHC..."
                onChange={(e) => onChange(e)}
                style={{ alignItems: 'flex-end', width: '100%' }}
              />
            </ColumnCenter>
          </RowBetween>
        </Section>
      )}
    </>
  )
}

export function DpoTargetDpoSeatsHorizontal({
  seats,
  seatCap,
  targetDpoName,
  emptySeats,
  onChange,
}: {
  seats: number
  emptySeats: string
  seatCap?: number
  targetDpoName: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <>
      {seatCap && (
        <Section>
          <Row justifyContent="flex-end">
            <SText mobileFontSize="10px">
              {t(`Remaining Seats`)}: {emptySeats}
            </SText>
          </Row>
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{`${t(`# Seats in`)}: ${targetDpoName}`}</SText>
              <QuestionHelper
                text={t(
                  `The # of Seats you wish to buy from this DPO will determine the crowdfunding target of your new DPO. The crowdfunding target will be split equally to 100 seats in your DPO.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <ColumnCenter>
              <BorderedInput
                required
                id="dpo-seats"
                type="number"
                placeholder={`1 - ${seatCap}`}
                onChange={(e) => onChange(e)}
                value={Number.isNaN(seats) ? '' : seats}
                style={{ alignItems: 'flex-end', width: '100%' }}
              />
            </ColumnCenter>
          </RowBetween>
        </Section>
      )}
    </>
  )
}