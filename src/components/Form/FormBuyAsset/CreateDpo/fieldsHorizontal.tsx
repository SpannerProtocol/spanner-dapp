import { useTranslation } from 'react-i18next'
import { useSubstrate } from '../../../../hooks/useSubstrate'
import useSubscribeBalance from '../../../../hooks/useQueryBalance'
import React, { useCallback, useContext } from 'react'
import { BorderedWrapper, Section } from '../../../Wrapper'
import Row, { RowBetween, RowFixed } from '../../../Row'
import { SText } from '../../../Text'
import { bnToUnit, formatToUnit } from '../../../../utils/formatUnit'
import QuestionHelper from '../../../QuestionHelper'
import { BorderedInput, SInput } from '../../../Input'
import { PillButton } from '../../../Button'
import { ErrorMsg } from 'pages/Dex/components'
import { ThemeContext } from 'styled-components'
import { ColumnCenter } from '../../../Column'
import BN from 'bn.js'
import { PrimaryMUISlider } from '../../../Slider'

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
  managerAmount,
  passengerShareCap,
  passengerShareMinimum,
  token,
  errMsg,
  onChange,
}: {
  managerAmount?: number
  passengerShareCap?: BN
  passengerShareMinimum?: BN
  dpoName: string
  token: string
  onChange: (managerAmount: number) => void
  errMsg?: string
}) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const balance = useSubscribeBalance(token)

  const handleMax = useCallback(() => {
    if (!passengerShareCap) return
    if (balance.gt(passengerShareCap)) {
      onChange(parseFloat(bnToUnit(passengerShareCap, chainDecimals, 0, true)))
    } else {
      onChange(parseFloat(bnToUnit(balance, chainDecimals, 0, true)))
    }
  }, [balance, onChange, passengerShareCap, chainDecimals])

  const handleSliderChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChange(newValue)
    }
  }
  return (
    <>
      {passengerShareCap && passengerShareMinimum && (
        <Section>
          {/*<Row justifyContent="flex-end">*/}
          {/*  <SText mobileFontSize="10px" fontSize="10px" width={'fit-content'}>*/}
          {/*    {t(`Seat Cost`)}: {formatToUnit(costPerSeat, chainDecimals)} {token}*/}
          {/*  </SText>*/}
          {/*</Row>*/}
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{`${t(`Manager Shares`)} (${token})`}</SText>
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
                    placeholder={`${formatToUnit(passengerShareMinimum, chainDecimals, 2)} - ${formatToUnit(
                      passengerShareCap,
                      chainDecimals,
                      2
                    )}`}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    value={Number.isNaN(managerAmount) || !managerAmount ? '' : managerAmount.toString()}
                    style={{ alignItems: 'flex-end', width: '100%' }}
                  />
                  <PillButton
                    onClick={handleMax}
                    padding="0.25rem"
                    mobilePadding="0.25rem"
                    margin="0 0rem"
                    minWidth="60px"
                    mobileMinWidth="60px"
                  >
                    {t(`Max`)}
                  </PillButton>
                </RowFixed>
              </BorderedWrapper>
              {errMsg && <ErrorMsg>{errMsg}</ErrorMsg>}
              <PrimaryMUISlider
                value={Number.isNaN(managerAmount) || !managerAmount ? 0 : managerAmount}
                onChange={handleSliderChange}
                aria-labelledby="continuous-slider"
                min={parseFloat(formatToUnit(passengerShareMinimum, chainDecimals, 2))}
                max={parseFloat(formatToUnit(passengerShareCap, chainDecimals, 2))}
              />
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
  targetAmount,
  dpoShareCap,
  dpoShareMinimum,
  targetDpoName,
  emptyAmount,
  targetDPOTargetAmount,
  token,
  onChange,
}: {
  targetAmount: number
  emptyAmount: BN
  dpoShareCap?: BN
  dpoShareMinimum?: BN
  targetDpoName: string
  targetDPOTargetAmount?: BN
  token: string
  onChange: (e: number) => void
}) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const handleSliderChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChange(newValue)
    }
  }

  return (
    <>
      {targetDPOTargetAmount && dpoShareCap && dpoShareMinimum && (
        <Section>
          <Row justifyContent="flex-end">
            <SText mobileFontSize="10px">
              {t(`Remaining`)}: {formatToUnit(emptyAmount, chainDecimals, 2)} {token}
            </SText>
          </Row>
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{`${t('Crowdfund Amount')} (${token})`}</SText>
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
                placeholder={`${formatToUnit(dpoShareMinimum, chainDecimals, 2)} - ${formatToUnit(
                  dpoShareCap,
                  chainDecimals,
                  2
                )}`}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                value={Number.isNaN(targetAmount) || !targetAmount ? '' : targetAmount.toString()}
                style={{ alignItems: 'flex-end', width: '100%' }}
              />
              <PrimaryMUISlider
                value={Number.isNaN(targetAmount) || !targetAmount ? 0 : targetAmount}
                onChange={handleSliderChange}
                aria-labelledby="continuous-slider"
                min={parseFloat(formatToUnit(dpoShareMinimum, chainDecimals, 2))}
                max={parseFloat(formatToUnit(dpoShareCap, chainDecimals, 2))}
              />
            </ColumnCenter>
          </RowBetween>
        </Section>
      )}
    </>
  )
}
