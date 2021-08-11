import BN from 'bn.js'
import BalanceComponent from 'components/Balance'
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { Dispatcher } from 'types/dispatcher'
import { blockToDays } from 'utils/formatBlocks'
import { abs, noNan } from 'utils/formatNumbers'
import { bnToUnit, bnToUnitNumber, formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from 'utils/validAddress'
import { CreateDpoData } from '..'
import { ColumnCenter } from '../../../Column'
import {
  DpoBaseFeeHorizontal,
  DpoDirectReferralRateHorizontal,
  DpoEndHorizontal,
  DpoManagerSeatsHorizontal,
  DpoNameHorizontal,
  DpoReferralCodeHorizontal,
  DpoTargetDpoSeatsHorizontal,
} from './fieldsHorizontal'
import { DpoFormCoreProps } from './index'
import { getDpoRemainingPurchase } from '../../../../utils/getDpoData'
import Decimal from 'decimal.js'

interface DpoTargetDpoFormProps extends DpoFormCoreProps {
  dpoInfo: DpoInfo
  token: string
  onSubmit: (data: any) => void
}

interface TxConfirmProps {
  dpoInfo: DpoInfo
  token: string
  isOpen: boolean
  setIsOpen: Dispatcher<boolean>
  createDpoData: CreateDpoData
  txInfo: TxInfo
  submitTx: (params: SubmitTxParams) => void
}

interface DpoCreateDpoTxConfirmProps extends CreateDpoData {
  target: string
  targetAmount: string
  token: string
  estimatedFee?: string
  dpoInfo: DpoInfo
}

function TxConfirm({
  target,
  targetAmount,
  dpoName,
  token,
  targetPurchaseAmount,
  managerPurchaseAmount,
  baseFee,
  directReferralRate,
  end,
  estimatedFee,
  dpoInfo,
  referrer,
  newReferrer,
}: DpoCreateDpoTxConfirmProps) {
  const { t } = useTranslation()
  const { expectedBlockTime, lastBlock } = useBlockManager()

  const endInDays =
    end && expectedBlockTime && lastBlock
      ? Math.ceil(parseFloat(blockToDays(new BN(end).sub(lastBlock), expectedBlockTime, 4))).toString()
      : undefined

  let managerRate = 0
  if (managerPurchaseAmount && targetPurchaseAmount && baseFee) {
    managerRate = parseFloat(new Decimal(managerPurchaseAmount).dividedBy(targetPurchaseAmount).mul(100).toFixed(1))
    if (managerRate + parseFloat(baseFee) > 20) {
      managerRate = 20 - parseFloat(baseFee)
    }
  }

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
        <RowBetween>
          <SText>{t(`Crowdfund Amount`)}</SText>
          <SText>
            {targetPurchaseAmount?.toFixed(2)} {token}
          </SText>
        </RowBetween>
        {end && endInDays && (
          <RowBetween>
            <SText>{t(`Crowdfund Period`)}</SText>
            <SText>{`${endInDays} ${t(`days`)}`}</SText>
          </RowBetween>
        )}
        {managerRate && baseFee && (
          <RowBetween>
            <SText>{t(`Management Fee`)}</SText>
            <SText>
              {`${baseFee} (${t(`Base`)}) + ${managerRate} (${t(`Shares`)}) = ${Math.round(
                managerRate + parseFloat(baseFee)
              ).toString()}%`}
            </SText>
          </RowBetween>
        )}
        {directReferralRate && (
          <>
            <RowBetween>
              <SText>{t(`Direct Referral Rate`)}</SText>
              <SText>
                {`${directReferralRate} (${t(`Direct`)}) + ${100 - parseInt(directReferralRate)} (${t(`2nd`)}) = 100%`}
              </SText>
            </RowBetween>
          </>
        )}
        <Divider />
        {managerPurchaseAmount && (
          <RowBetween>
            <HeavyText fontSize="14px">{t(`Required deposit`)}</HeavyText>
            <HeavyText fontSize="14px">
              {`${managerPurchaseAmount.toFixed(2)} 
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
      <BalanceComponent token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

export default function DpoTargetDpoForm({ dpoInfo, token, onSubmit }: DpoTargetDpoFormProps) {
  const [targetPurchaseAmount, setTargetPurchaseAmount] = useState<number>(0)
  const [managerPurchaseAmount, setManagerPurchaseAmount] = useState<number>(0)
  const [managerShareRate, setManagerShareRate] = useState<number>(0)
  const [baseFee, setBaseFee] = useState<number>(0)
  const { dpoSharePercentCap, dpoSharePercentMinimum, passengerSharePercentCap, passengerSharePercentMinimum } =
    useConsts()
  const [directReferralRate, setDirectReferralRate] = useState<number>(70)
  const [dpoName, setDpoName] = useState<string>('')
  const [end, setEnd] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const [newReferrer, setNewReferrer] = useState<boolean>(false)
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const balance = useSubscribeBalance(token.toUpperCase())
  const [dpoManagerSeatsErrMsg, setDpoManagerSeatsErrMsg] = useState<string>('')
  const [dpoTargetSeatsErrMsg, setDpoTargetSeatsErrMsg] = useState<string>('')
  const [errNameTooShort, setErrNameTooShort] = useState<boolean>(false)
  const { chainDecimals } = useSubstrate()
  const hasError = useMemo(
    () => dpoTargetSeatsErrMsg.length > 0 || dpoManagerSeatsErrMsg.length > 0 || errNameTooShort,
    [dpoTargetSeatsErrMsg, dpoManagerSeatsErrMsg, errNameTooShort]
  )

  // Subtracting 500 blocks to give buffer if the user idles on the form
  const maxEnd =
    expectedBlockTime &&
    lastBlock &&
    blockToDays(dpoInfo.expiry_blk.sub(lastBlock).sub(new BN(500)), expectedBlockTime, 2)

  const dpoInfoTargetAmountNumber = new Decimal(bnToUnit(dpoInfo.target_amount, chainDecimals, 0))
  const dpoShareCap = dpoSharePercentCap ? dpoInfoTargetAmountNumber.mul(dpoSharePercentCap).toNumber() : 0
  const dpoShareMinimum = dpoSharePercentMinimum ? dpoInfoTargetAmountNumber.mul(dpoSharePercentMinimum).toNumber() : 0

  const passengerShareCap = passengerSharePercentCap
    ? new Decimal(targetPurchaseAmount.toString()).mul(passengerSharePercentCap).toNumber()
    : 0
  const passengerShareMinimum = passengerSharePercentMinimum
    ? new Decimal(targetPurchaseAmount.toString()).mul(passengerSharePercentMinimum).toNumber()
    : 0

  const handleDpoName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    if (name.length <= 0) {
      setErrNameTooShort(true)
    } else {
      setErrNameTooShort(false)
    }
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

  const handleTargetPurchaseAmount = (value: number) => {
    if (!dpoSharePercentCap || !dpoSharePercentMinimum) return
    if (value > dpoShareCap) return
    setTargetPurchaseAmount(value)
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

  const handleManagerPurchaseAmount = (value: number) => {
    if (!passengerShareCap || !passengerShareMinimum) return
    if (value > passengerShareCap) return
    setManagerPurchaseAmount(value)

    let shareRate = parseFloat(new Decimal(value).dividedBy(targetPurchaseAmount).mul(100).toFixed(1))
    if (shareRate + baseFee > 20) {
      shareRate = 20 - baseFee
    }
    setManagerShareRate(shareRate)
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
      targetPurchaseAmount: targetPurchaseAmount,
      managerPurchaseAmount: managerPurchaseAmount,
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

  useEffect(() => {
    const balanceUnit = bnToUnitNumber(balance, chainDecimals)
    if (balanceUnit < managerPurchaseAmount) {
      setDpoManagerSeatsErrMsg('Insufficient Balance')
    } else if (managerPurchaseAmount < passengerShareMinimum && managerPurchaseAmount > 0) {
      setDpoManagerSeatsErrMsg('Less than minimum')
    } else {
      setDpoManagerSeatsErrMsg('')
    }

    if (targetPurchaseAmount < dpoShareMinimum && targetPurchaseAmount > 0) {
      setDpoTargetSeatsErrMsg('Less than minimum')
    } else {
      setDpoTargetSeatsErrMsg('')
    }
  }, [
    balance,
    dpoInfo,
    targetPurchaseAmount,
    managerPurchaseAmount,
    chainDecimals,
    dpoShareMinimum,
    passengerShareMinimum,
  ])

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
            <RowFixed>
              <SText mobileFontSize="10px">{`${t(`Default Target`)}`}</SText>
              <QuestionHelper
                text={t(
                  `The Default Target is a goal that all members agree to pursue. When the DPO is ACTIVE, the Default Target must be selected if available.`
                )}
                size={10}
                backgroundColor={'#fff'}
              />
            </RowFixed>
            <SText width="100%" textAlign="right">{`DPO:${dpoInfo.name.toString()}`}</SText>
          </RowBetween>
        </Section>
        <DpoTargetDpoSeatsHorizontal
          targetAmount={targetPurchaseAmount}
          emptyAmount={bnToUnitNumber(getDpoRemainingPurchase(dpoInfo), chainDecimals)}
          dpoShareCap={dpoShareCap}
          dpoShareMinimum={dpoShareMinimum}
          targetDpoName={dpoInfo.name.toString()}
          token={token}
          errMsg={dpoTargetSeatsErrMsg.length > 0 ? t(dpoTargetSeatsErrMsg) : undefined}
          onChange={handleTargetPurchaseAmount}
        />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`DPO Info`)}</HeavyText>
          <Divider />
        </Section>
        <DpoNameHorizontal onChange={handleDpoName} error={errNameTooShort} />
        <DpoEndHorizontal end={end} maxEnd={maxEnd} onChange={handleEnd} />
      </SpacedSection>
      <SpacedSection>
        <Section>
          <HeavyText mobileFontSize="14px">{t(`Incentive Structure`)}</HeavyText>
          <Divider />
        </Section>
        <DpoBaseFeeHorizontal baseFee={baseFee} onChange={handleBaseFee} />
        <DpoManagerSeatsHorizontal
          passengerShareCap={passengerShareCap}
          passengerShareMinimum={passengerShareMinimum}
          dpoName={dpoName ? dpoName : ''}
          managerAmount={managerPurchaseAmount}
          token={token}
          onChange={handleManagerPurchaseAmount}
          errMsg={dpoManagerSeatsErrMsg.length > 0 ? t(dpoManagerSeatsErrMsg) : undefined}
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
                <SText>{`${noNan(baseFee + managerShareRate)}%`}</SText>
                <SText>{`${noNan(baseFee)} (${t(`Base`)}) + ${noNan(managerShareRate)} (${t(`Shares`)})`}</SText>
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
            <HeavyText width={'fit-content'}>{`${managerPurchaseAmount.toFixed(2)} ${token}`}</HeavyText>
          </RowBetween>
        </Section>
      </SpacedSection>
      <Section style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <ButtonPrimary
          maxWidth="none"
          mobileMaxWidth="none"
          onClick={handleSubmit}
          disabled={hasError || dpoName.length <= 0 || managerPurchaseAmount < 0 || targetPurchaseAmount < 0}
        >
          {t(`Create DPO`)}
        </ButtonPrimary>
      </Section>
    </>
  )
}

export function DpoTargetDpoTxConfirm({
  dpoInfo,
  token,
  isOpen,
  setIsOpen,
  createDpoData,
  txInfo,
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
          target={dpoInfo.name.toString()}
          targetAmount={createDpoData.targetPurchaseAmount ? createDpoData.targetPurchaseAmount.toFixed(2) : '0'}
          token={token}
          estimatedFee={txInfo.estimatedFee}
          dpoInfo={dpoInfo}
        />
      </TxModal>
    </>
  )
}
