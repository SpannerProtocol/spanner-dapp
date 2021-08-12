import { useTranslation } from 'react-i18next'
import { useSubstrate } from '../../../../hooks/useSubstrate'
import useSubscribeBalance from '../../../../hooks/useQueryBalance'
import { useCallback, useContext } from 'react'
import { BorderedWrapper, Section } from '../../../Wrapper'
import Row, { RowBetween, RowFixed } from '../../../Row'
import { SText } from '../../../Text'
import { bnToUnitNumber } from '../../../../utils/formatUnit'
import QuestionHelper from '../../../QuestionHelper'
import { BorderedInput, SInput } from '../../../Input'
import { PillButton } from '../../../Button'
import { ErrorMsg } from 'pages/Dex/components'
import { ThemeContext } from 'styled-components'
import { ColumnCenter } from '../../../Column'
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
            text={t(`The base fee of your management fee (in %). Manager Fee = Base Fee + Manager Shares.`)}
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
  passengerShareCap?: number
  passengerShareMinimum?: number
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
    const balanceUnit = bnToUnitNumber(balance, chainDecimals)
    if (balanceUnit >= passengerShareCap) {
      onChange(passengerShareCap)
    } else {
      onChange(balanceUnit)
    }
  }, [balance, onChange, passengerShareCap, chainDecimals])

  const handleSliderChange = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChange(newValue)
    }
  }

  return (
    <>
      {
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
                  `# of Shares to buy as Manager from your new DPO. This is your Management Fee (%) on Member's yields.`
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
                    placeholder={`${passengerShareMinimum ? passengerShareMinimum.toFixed(2) : '0'} - ${
                      passengerShareCap ? passengerShareCap.toFixed(2) : '0'
                    }`}
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
                min={passengerShareMinimum}
                max={passengerShareCap}
                step={0.01}
              />
            </ColumnCenter>
          </RowBetween>
        </Section>
      }
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
  token,
  errMsg,
  onChange,
}: {
  targetAmount: number
  emptyAmount: number
  dpoShareCap?: number
  dpoShareMinimum?: number
  targetDpoName: string
  token: string
  errMsg?: string
  onChange: (e: number) => void
}) {
  const { t } = useTranslation()
  const handleSliderChange = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChange(newValue)
    }
  }

  return (
    <>
      {dpoShareCap && dpoShareMinimum && (
        <Section>
          <Row justifyContent="flex-end">
            <SText mobileFontSize="10px">
              {t(`Remaining`)}: {emptyAmount.toFixed(2)} {token}
            </SText>
          </Row>
          <RowBetween>
            <RowFixed>
              <SText mobileFontSize="10px">{`${t('Crowdfund Amount')} (${token})`}</SText>
              <QuestionHelper
                text={t(
                  `The # of Shares you wish to buy from THIS DPO will determine the crowdfunding target of YOUR new DPO.`
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
                placeholder={`${dpoShareMinimum.toFixed(2)} - ${dpoShareCap.toFixed(2)}`}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                value={Number.isNaN(targetAmount) || !targetAmount ? '' : targetAmount.toString()}
                style={{ alignItems: 'flex-end', width: '100%' }}
              />
              {errMsg && <ErrorMsg>{errMsg}</ErrorMsg>}
              <PrimaryMUISlider
                value={Number.isNaN(targetAmount) || !targetAmount ? 0 : targetAmount}
                onChange={handleSliderChange}
                aria-labelledby="continuous-slider"
                min={dpoShareMinimum}
                max={dpoShareCap}
                step={0.01}
              />
            </ColumnCenter>
          </RowBetween>
        </Section>
      )}
    </>
  )
}
