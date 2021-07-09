import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useReferrer } from 'hooks/useReferrer'
import { useSubstrate } from 'hooks/useSubstrate'
import { SubmitTxParams, TxInfo } from 'hooks/useTxHelpers'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TravelCabinInfo } from 'spanner-interfaces'
import { Dispatcher } from 'types/dispatcher'
import { blockToDays } from 'utils/formatBlocks'
import { noNan } from 'utils/formatNumbers'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from 'utils/validAddress'
import { ColumnCenter } from '../../../Column'
import {
  DpoBaseFeeHorizontal,
  DpoDirectReferralRateHorizontal,
  DpoEndHorizontal,
  DpoManagerSeatsHorizontal,
  DpoNameHorizontal,
  DpoReferralCodeHorizontal,
} from './fieldsHorizontal'
import { DpoFormCoreProps } from './index'

interface DpoTargetCabinFormProps extends DpoFormCoreProps {
  travelCabinInfo: TravelCabinInfo
  token: string
  onSubmit: (data: any) => void
}

interface TxConfirmProps {
  travelCabinInfo: TravelCabinInfo
  token: string
  isOpen: boolean
  setIsOpen: Dispatcher<boolean>
  createDpoData: CreateDpoData
  txInfo: TxInfo
  submitTx: (params: SubmitTxParams) => void
}

interface TravelCabinCrowdfundTxConfirmProps {
  target?: string
  targetAmount?: string
  dpoName?: string
  managerSeats?: string
  baseFee?: string
  directReferralRate?: string
  end?: string
  referrer?: string | null
  newReferrer?: boolean
  token?: string
  estimatedFee?: string
}

export function TxConfirm({
  target,
  targetAmount,
  dpoName,
  managerSeats,
  baseFee,
  directReferralRate,
  end,
  token,
  estimatedFee,
  referrer,
  newReferrer,
}: TravelCabinCrowdfundTxConfirmProps) {
  const { t } = useTranslation()
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const { chainDecimals } = useSubstrate()

  const endInDays =
    end && expectedBlockTime && lastBlock
      ? Math.ceil(parseFloat(blockToDays(new BN(end).sub(lastBlock), expectedBlockTime, 4)))
      : undefined

  return (
    <>
      <Section>
        <SText>{t(`Verify DPO details`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`Default Target`)}</SText>
          <SText>{target}</SText>
        </RowBetween>
        <RowBetween>
          <SText>{t(`DPO Name`)}</SText>
          <SText>{dpoName}</SText>
        </RowBetween>
        {targetAmount && (
          <RowBetween>
            <SText>{t(`Crowdfunding Amount`)}</SText>
            <SText>
              {formatToUnit(targetAmount, chainDecimals, 2)} {token}
            </SText>
          </RowBetween>
        )}
        {end && endInDays && (
          <RowBetween>
            <SText>{t(`Crowdfunding Period`)}</SText>
            <SText fontSize="12px">{`~${t(`Block`)} #${end} (${endInDays} ${t(`days`)})`}</SText>
          </RowBetween>
        )}
        {managerSeats && baseFee && (
          <RowBetween>
            <SText>{t(`Management Fee`)}</SText>
            <SText>
              {`${baseFee} (${t(`Base`)}) + ${managerSeats} (${t(`Seats`)}) = ${Math.round(
                parseFloat(managerSeats) + parseFloat(baseFee)
              ).toString()}%`}
            </SText>
          </RowBetween>
        )}
        {directReferralRate && (
          <RowBetween>
            <SText>{t(`Direct Referral Rate`)}</SText>
            <SText>
              {`${parseInt(directReferralRate)} (${t(`Direct`)}) + ${100 - parseInt(directReferralRate)} (${t(
                `2nd`
              )}) = 100%`}
            </SText>
          </RowBetween>
        )}
        <Divider />
        {managerSeats && targetAmount && (
          <RowBetween>
            <HeavyText fontSize="14px">{t(`Required Deposit`)}</HeavyText>
            <HeavyText fontSize="14px">
              {`${formatToUnit(new BN(managerSeats).mul(new BN(targetAmount).div(new BN(100))), chainDecimals, 2)} 
              ${token}`}
            </HeavyText>
          </RowBetween>
        )}
      </BorderedWrapper>
      {newReferrer && referrer && (
        <BorderedWrapper>
          <RowBetween>
            <SText>{t(`Referral Code`)}</SText>
            <SText>{shortenAddr(referrer, 5)}</SText>
          </RowBetween>
        </BorderedWrapper>
      )}
      {token && <Balance token={token} />}
      <TxFee fee={estimatedFee} />
    </>
  )
}

export default function DpoTargetCabinForm({ travelCabinInfo, token, onSubmit }: DpoTargetCabinFormProps) {
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
  const { chainDecimals } = useSubstrate()

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

  if (!chainDecimals) return null

  return (
    <>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`DPO Goal`)}</HeavyText>
          <Divider />
        </Section>
        <Section>
          <RowBetween>
            <RowFixed width="fit-content">
              <SText>{t(`Default Target`)}</SText>
              <QuestionHelper
                text={t(
                  `The Default Target is a goal that all members agree to pursue. When the DPO is ACTIVE, the Default Target must be selected if available.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <SText width={'fit-content'}>{`${t(`TravelCabin`)}: ${travelCabinInfo.name.toString()}`}</SText>
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
          <RowBetween>
            <SText>{t('Available Balance')}</SText>
            <SText>{`${formatToUnit(balance, chainDecimals, 2)} ${token}`}</SText>
          </RowBetween>
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
        <ButtonPrimary
          maxWidth="none"
          mobileMaxWidth="none"
          onClick={handleSubmit}
          disabled={hasError || dpoName.length <= 0}
        >
          {t(`Create DPO`)}
        </ButtonPrimary>
      </Section>
    </>
  )
}

interface CreateDpoData {
  dpoName?: string
  targetSeats?: string
  managerSeats?: string
  baseFee?: string
  directReferralRate?: string
  end?: string
  referrer?: string | null
  newReferrer?: boolean
}

/**
 * Form Wrapper for CreateDpo - DpoTargetCabin
 * Manages Form and Tx Confirmation
 */
export function DpoTargetCabinTxConfirm({
  travelCabinInfo,
  token,
  createDpoData,
  txInfo,
  isOpen,
  setIsOpen,
  submitTx,
}: TxConfirmProps) {
  const { t } = useTranslation()
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()

  const dismissModal = () => {
    setIsOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  // const handleCreateDpo = ({
  //   dpoName,
  //   managerSeats,
  //   baseFee,
  //   directReferralRate,
  //   end,
  //   referrer,
  //   newReferrer,
  // }: {
  //   dpoName: string
  //   managerSeats: number
  //   baseFee: number
  //   directReferralRate: number
  //   end: number
  //   referrer: string
  //   newReferrer: boolean
  // }) => {
  //   if (!lastBlock || !expectedBlockTime || !travelCabinInfo) {
  //     return
  //   }
  //   const daysBlocks = daysToBlocks(end, expectedBlockTime)
  //   const endBlock = lastBlock.add(daysBlocks)
  //   setCreateDpoData({
  //     dpoName,
  //     managerSeats: managerSeats.toString(),
  //     baseFee: baseFee.toString(),
  //     directReferralRate: directReferralRate.toString(),
  //     end: endBlock.toString(),
  //     referrer,
  //     newReferrer,
  //   })
  //   const txData = createTx({
  //     section: 'bulletTrain',
  //     method: 'createDpo',
  //     params: {
  //       name: dpoName,
  //       target: { TravelCabin: travelCabinInfo.index.toString() },
  //       managerSeats,
  //       baseFee: baseFee * 10,
  //       directReferralRate: directReferralRate * 10,
  //       end: endBlock.toString(),
  //       referrer,
  //     },
  //   })
  //   if (!txData) return
  //   txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
  //   openTxConfirm()
  // }

  return (
    <>
      <TxModal
        isOpen={isOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Create DPO`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <TxConfirm
          {...createDpoData}
          target={travelCabinInfo.name.toString()}
          targetAmount={travelCabinInfo.deposit_amount.toString()}
          token={token}
          estimatedFee={txInfo?.estimatedFee}
        />
      </TxModal>
    </>
  )
}
