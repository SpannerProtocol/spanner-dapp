import BN from 'bn.js'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { FlatCard } from 'components/Card'
import ExpandCard from 'components/Card/ExpandCard'
import CopyHelper from 'components/Copy/Copy'
import { BorderedInput } from 'components/Input'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import { ProgressBar } from 'components/ProgressBar'
import QuestionHelper, { AnyQuestionHelper } from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { StatContainer, StatDisplayContainer, StatDisplayGrid, StatText, StatValue } from 'components/StatDisplay'
import { DataTokenName, Heading, HeavyText, SectionHeading, SmallText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import {
  BorderedWrapper,
  ButtonWrapper,
  CollapseWrapper,
  ContentWrapper,
  IconWrapper,
  MemberWrapper,
  Section,
  SpacedSection,
  StateWrapper,
} from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import { useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useReferrer } from 'hooks/useReferrer'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { useUserInDpo } from 'hooks/useUser'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useContext, useEffect, useState } from 'react'
import { Share2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo, DpoMemberInfo } from 'spanner-interfaces/types'
import { useProjectManager } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { DPO_STATE_COLORS, DPO_STATE_TOOLTIPS } from '../../../constants'
import getApy from '../../../utils/getApy'
import getCabinClass from '../../../utils/getCabinClass'
import DpoActions from './actions'

const statsBg = 'linear-gradient(90deg, #FFBE2E -11.67%, #FF9E04 100%)'
const membershipBg = 'linear-gradient(90deg, #EC3D3D -11.67%, #AD074F 100%)'

interface DpoItemProps {
  dpoIndex: string
}

interface DpoJoinFormProps {
  dpoInfo: DpoInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

interface DpoCrowdFormProps {
  dpoInfo: DpoInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

interface JoinData {
  dpoIndex?: string
  targetSeats?: string
  referrer?: string | null
}

interface DpoJoinTxConfirmProps extends JoinData {
  deposit: string
  token: string
  estimatedFee?: string
}
interface CrowdfundData {
  dpoName?: string
  targetSeats?: string
  managerSeats?: string
  baseFee?: number
  directReferralRate?: number
  end?: number
  referrer?: string | null
}
interface DpoCrowdfundTxConfirmProps extends CrowdfundData {
  deposit: string
  token: string
  estimatedFee?: string
}

function DpoCrowdfundForm({ dpoInfo, token, chainDecimals, onSubmit }: DpoCrowdFormProps) {
  const [seats, setSeats] = useState<string>('')
  const [managerSeats, setManagerSeats] = useState<string | null>('')
  const [baseFee, setBaseFee] = useState<number>(0)
  const { passengerSeatCap, dpoSeatCap } = useConsts()
  const [directReferralRate, setDirectReferralRate] = useState<number>(0)
  const [dpoName, setDpoName] = useState<string | null>('')
  const [end, setEnd] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()

  const handleReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value.length === 0) {
      setReferralCode(null)
    } else {
      setReferralCode(value)
    }
  }

  const handleEnd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setEnd(parseInt(value))
  }

  const handleSubmit = () =>
    onSubmit({ seats, managerSeats, end, dpoName, baseFee, directReferralRate, referrer: referralCode })

  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  return (
    <>
      <Section>
        <StandardText>{t(`Create another DPO to Crowdfund for this DPO's fundraising target.`)}</StandardText>
      </Section>
      <Section>
        <BorderedWrapper>
          <RowBetween>
            <RowFixed>
              <StandardText>{t(`Ticket Fare`)}</StandardText>
              <QuestionHelper
                text={t(
                  `The cost of Ticket Fare is split equally by DPO seats. Your purchase price is equal to the number of seats you want to buy.`
                )}
                size={12}
                backgroundColor={'#fff'}
              ></QuestionHelper>
            </RowFixed>
            <StandardText>
              {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals, 2)} {token}
            </StandardText>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <StandardText>{t(`Remaining Seats`)}</StandardText>
              <QuestionHelper
                text={t(`Amount of Seats left in DPO. There are 100 seats per DPO.`)}
                size={12}
                backgroundColor={'#fff'}
              ></QuestionHelper>
            </RowFixed>
            <StandardText>{dpoInfo.empty_seats.toString()}</StandardText>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <StandardText>{t(`Max Seats per Passenger`)}</StandardText>
              <QuestionHelper
                text={t(`The highest number of Seats a Passenger can buy.`)}
                size={12}
                backgroundColor={'#fff'}
              ></QuestionHelper>
            </RowFixed>
            <StandardText>{passengerSeatCap}</StandardText>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <StandardText>{t(`Max Seats per DPO`)}</StandardText>
              <QuestionHelper
                text={t(`The highest number of Seats a DPO can buy.`)}
                size={12}
                backgroundColor={'#fff'}
              ></QuestionHelper>
            </RowFixed>
            <StandardText>{dpoSeatCap}</StandardText>
          </RowBetween>
        </BorderedWrapper>
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Name your DPO`)}</StandardText>
          <QuestionHelper
            text={t(`Name your DPO community to make it easier for others to search for you.`)}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-name"
          type="string"
          placeholder="Name"
          onChange={(e) => setDpoName(e.target.value)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Seats to Buy`)}</StandardText>
          <QuestionHelper
            text={t(
              `The # of Seats you wish to buy from this DPO will determine the crowdfunding target of your new DPO. The crowdfunding target will be split equally to 100 seats in your DPO.`
            )}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-seats"
          type="string"
          placeholder="0"
          onChange={(e) => setSeats(e.target.value)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Manager Seats in New DPO`)}</StandardText>
          <QuestionHelper
            text={t(
              `# of Seats to buy for yourself as Manager from your new DPO. More seats, more commission rate off your Members' bonuses.`
            )}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-manager-seats"
          type="string"
          placeholder="0"
          onChange={(e) => setManagerSeats(e.target.value)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Base Fee`)}</StandardText>
          <QuestionHelper
            text={t(`The base fee of your management fee (in %). Manager Fee = Base Fee + Manager Seats.`)}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-base-fee"
          type="number"
          min="0"
          max="5"
          placeholder="0 - 5"
          onChange={(e) => setBaseFee(parseInt(e.target.value))}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Direct Referral Rate`)}</StandardText>
          <QuestionHelper
            text={t(`The referral bonus rate given to the Direct Referrer.`)}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-direct-referral-rate"
          type="number"
          min="0"
          max="100"
          placeholder="0 - 100"
          onChange={(e) => setDirectReferralRate(parseInt(e.target.value))}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`End Block`)}</StandardText>
          <QuestionHelper
            text={t(
              `The Block Number for this Crowdfund to target. Passengers might not want to join your DPO if it does not have a realistic deadline for crowdfunding.`
            )}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-end-block"
          type="string"
          placeholder="0"
          onChange={(e) => handleEnd(e)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      {!referralCode && (
        <Section>
          <RowFixed>
            <StandardText>{t(`Referral Code`)}</StandardText>
            <QuestionHelper
              text={t(
                `Referral Codes are permanent and unique for each project on Spanner. If you arrived to Spanner Dapp via a Referral Link then the that Referral Code will be used.`
              )}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="A3FDHC..."
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        </Section>
      )}
      <Section style={{ marginTop: '1rem' }}>
        <ButtonPrimary onClick={handleSubmit}>{t(`Create DPO`)}</ButtonPrimary>
      </Section>
    </>
  )
}

function DpoCrowdfundTxConfirm(props: DpoCrowdfundTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Create a DPO to Crowdfund for this DPO.`)}</StandardText>
      </Section>
      <SpacedSection>
        <RowBetween>
          <StandardText>{t(`DPO Name`)}</StandardText>
          <StandardText>{props.dpoName}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Ticket Fare`)}</StandardText>
          <StandardText>
            {props.deposit} {props.token}
          </StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Target DPO Seats`)}</StandardText>
          <StandardText>{props.targetSeats}</StandardText>
        </RowBetween>
        {props.managerSeats && props.baseFee && (
          <RowBetween>
            <StandardText>{t(`Manager Fee`)}</StandardText>
            <StandardText>{Math.round(parseFloat(props.managerSeats) + props.baseFee).toString()} %</StandardText>
          </RowBetween>
        )}
        {props.directReferralRate && (
          <RowBetween>
            <StandardText>{t(`Direct Referral Rate`)}</StandardText>
            <StandardText>{props.directReferralRate.toString()} %</StandardText>
          </RowBetween>
        )}
        <RowBetween>
          <StandardText>{t(`End Block`)}</StandardText>
          <StandardText>{props.end}</StandardText>
        </RowBetween>
      </SpacedSection>
      <TxFee fee={props.estimatedFee} />
    </>
  )
}

function DpoJoinTxConfirm(props: DpoJoinTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Confirm the details below.`)}</StandardText>
      </Section>
      <SpacedSection>
        <RowBetween>
          <StandardText>{t(`Seats`)}</StandardText>
          <StandardText>{props.targetSeats}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Ticket Fare`)}</StandardText>
          <StandardText>
            {props.deposit} {props.token}
          </StandardText>
        </RowBetween>
      </SpacedSection>
      <TxFee fee={props.estimatedFee} />
    </>
  )
}

function DpoJoinForm({ dpoInfo, token, chainDecimals, onSubmit }: DpoJoinFormProps) {
  const [seats, setSeats] = useState<string>('')
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()

  // This is only onChange
  const handleReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value.length === 0) {
      setReferralCode(null)
    } else {
      setReferralCode(value)
    }
  }

  const handleSubmit = () => {
    // Condition for if the user had a stored referrer
    onSubmit({ seats, referrer: referralCode })
  }

  useEffect(() => {
    if (!referralCode) {
      if (!referrer) return
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  return (
    <>
      <Section>
        <StandardText>{t(`Join this DPO to contribute to their Crowdfunding Target.`)}</StandardText>
      </Section>
      <Section>
        <RowBetween>
          <RowFixed>
            <StandardText>{t(`Seat Price`)}</StandardText>
            <QuestionHelper
              text={t(
                `The cost of Ticket Fare is split equally by DPO seats. Your purchase price is equal to the number of seats you want to buy.`
              )}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <StandardText>
            {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <StandardText>{t(`Remaining Seats`)}</StandardText>
            <QuestionHelper
              text={t(`Amount of Seats left in DPO. There are 100 seats per DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <StandardText>{dpoInfo.empty_seats.toString()}</StandardText>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <StandardText>{t(`Max Seats per Passenger`)}</StandardText>
            <QuestionHelper
              text={t(`The highest number of Seats a Passenger can buy.`)}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <StandardText>15</StandardText>
        </RowBetween>
      </Section>
      <Section>
        <RowFixed>
          <StandardText>{t(`Seats to Buy`)}</StandardText>
          <QuestionHelper
            text={t(
              `The # of Seats you wish to buy from this DPO will determine the crowdfunding target of your new DPO. The crowdfunding target will be split equally to 100 seats in your DPO.`
            )}
            size={12}
            backgroundColor={'#fff'}
          ></QuestionHelper>
        </RowFixed>
        <BorderedInput
          required
          id="dpo-seats"
          type="string"
          placeholder="0.0"
          onChange={(e) => setSeats(e.target.value)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      {!referralCode && (
        <Section>
          <RowFixed>
            <StandardText>{t(`Referral Code`)}</StandardText>
            <QuestionHelper
              text={t(
                `Referral Codes are permanent and unique for each project on Spanner. If you arrived to Spanner Dapp via a Referral Link then the that Referral Code will be used.`
              )}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
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
        <ButtonPrimary onClick={handleSubmit}>{t(`Join`)}</ButtonPrimary>
      </Section>
    </>
  )
}

function SelectedDpo({ dpoIndex }: DpoItemProps): JSX.Element {
  const dpoInfo = useSubDpo(dpoIndex)
  const dpoMembers = useQueryDpoMembers(dpoIndex)
  const wallet = useWallet()
  const [targetItem, setTargetItem] = useState<[string, string]>(['', ''])
  const { chainDecimals } = useSubstrate()
  const [userMemberInfo, setUserMemberInfo] = useState<DpoMemberInfo>()
  const [joinFormModalOpen, setJoinFormModalOpen] = useState<boolean>(false)
  const [crowdfundFormModalOpen, setCrowdfundFormModalOpen] = useState<boolean>(false)
  const [joinTxModalOpen, setJoinTxModalOpen] = useState<boolean>(false)
  const [crowdfundTxModalOpen, setCrowdfundTxModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData>({})
  const [joinData, setJoinData] = useState<JoinData>({})
  const userInDpo = useUserInDpo(dpoIndex, wallet?.address)
  const { expectedBlockTime } = useBlockManager()
  const { projectState } = useProjectManager()
  const [txInfo, setTxInfo] = useState<TxInfo>({})
  const isConnected = useIsConnected()
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const { lastBlock } = useBlockManager()
  const { passengerSeatCap } = useConsts()

  const { createTx, submitTx } = useTxHelpers()

  useEffect(() => {
    if (!dpoInfo) return
    if (dpoInfo.target.isTravelCabin) {
      setTargetItem(['TravelCabin', dpoInfo.target.asTravelCabin.toString()])
    } else {
      setTargetItem(['DPO', dpoInfo.target.asDpo[0].toString()])
    }
  }, [dpoInfo])

  const openJoinTxModal = () => {
    ;[setCrowdfundFormModalOpen, setJoinFormModalOpen, setCrowdfundTxModalOpen].forEach((fn) => fn(false))
    setJoinTxModalOpen(true)
  }

  const openCrowdfundTxModal = () => {
    ;[setJoinTxModalOpen, setCrowdfundFormModalOpen, setJoinFormModalOpen].forEach((fn) => fn(false))
    setCrowdfundTxModalOpen(true)
  }

  const openJoinFormModal = () => {
    ;[setCrowdfundTxModalOpen, setJoinTxModalOpen, setCrowdfundFormModalOpen].forEach((fn) => fn(false))
    setJoinFormModalOpen(true)
  }

  const openCrowdfundFormModal = () => {
    ;[setCrowdfundTxModalOpen, setJoinFormModalOpen, setJoinTxModalOpen].forEach((fn) => fn(false))
    setCrowdfundFormModalOpen(true)
  }

  const dismissModal = () => {
    ;[setJoinFormModalOpen, setCrowdfundFormModalOpen, setJoinTxModalOpen, setCrowdfundTxModalOpen].forEach((fn) =>
      fn(false)
    )
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const handleJoinFormCallback = ({ referrer, seats }: { referrer: string | null; seats: string }) => {
    if (!dpoIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    setJoinData({ dpoIndex, targetSeats: seats, referrer })
    const txData = createTx({
      section: 'bulletTrain',
      method: 'passengerBuyDpoSeats',
      params: { targetDpoIdx: dpoIndex, numberOfSeats: seats, referrerAccount: referrer },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    openJoinTxModal()
  }

  const handleCrowdfundFormCallback = ({
    dpoName,
    seats,
    managerSeats,
    baseFee,
    directReferralRate,
    end,
    referrer,
  }: {
    dpoName: string
    seats: string
    managerSeats: string
    baseFee: number
    directReferralRate: number
    end: number
    referrer: string
  }) => {
    setCrowdfundData({ dpoName, targetSeats: seats, managerSeats, baseFee, directReferralRate, end, referrer })
    if (!dpoIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    // baseFee and directReferralRate is per 0.1%
    const txData = createTx({
      section: 'bulletTrain',
      method: 'createDpo',
      params: {
        name: dpoName,
        target: { Dpo: [dpoIndex, seats] },
        managerSeats,
        baseFee: baseFee * 10,
        directReferralRate: directReferralRate * 10,
        end,
        referrer,
      },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))

    openCrowdfundTxModal()
  }

  useEffect(() => {
    if (!wallet || !wallet.address || !dpoMembers || dpoMembers.length === 0) return
    const memberInfo = dpoMembers.find(
      (entry) => entry[1].buyer.isPassenger && entry[1].buyer.asPassenger.eq(wallet.address)
    )
    setUserMemberInfo(memberInfo ? memberInfo[1] : undefined)
  }, [dpoMembers, wallet])

  if (!dpoInfo) return <></>
  const token = dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()

  return (
    <>
      <StandardModal title={t(`Join DPO`)} isOpen={joinFormModalOpen} onDismiss={dismissModal}>
        <DpoJoinForm dpoInfo={dpoInfo} token={token} chainDecimals={chainDecimals} onSubmit={handleJoinFormCallback} />
      </StandardModal>
      <StandardModal title={t(`Create DPO`)} isOpen={crowdfundFormModalOpen} onDismiss={dismissModal}>
        <DpoCrowdfundForm
          dpoInfo={dpoInfo}
          token={token}
          chainDecimals={chainDecimals}
          onSubmit={handleCrowdfundFormCallback}
        />
      </StandardModal>
      <TxModal
        isOpen={joinTxModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={t(`Join DPO`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <DpoJoinTxConfirm
          targetSeats={joinData.targetSeats}
          referrer={joinData.referrer}
          deposit={formatToUnit(
            dpoInfo.amount_per_seat.toBn().mul(new BN(joinData.targetSeats ? joinData.targetSeats : 0)),
            chainDecimals,
            2
          )}
          token={token}
          estimatedFee={txInfo.estimatedFee}
        />
      </TxModal>
      <TxModal
        isOpen={crowdfundTxModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={t(`Create DPO`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <DpoCrowdfundTxConfirm
          dpoName={crowdfundData.dpoName}
          managerSeats={crowdfundData.managerSeats}
          targetSeats={crowdfundData.targetSeats}
          end={crowdfundData.end}
          referrer={crowdfundData.referrer}
          deposit={formatToUnit(
            dpoInfo.amount_per_seat.toBn().mul(new BN(crowdfundData.targetSeats ? crowdfundData.targetSeats : 0)),
            chainDecimals,
            2
          )}
          token={token}
          estimatedFee={txInfo.estimatedFee}
        />
      </TxModal>
      <FlatCard
        style={{ marginBottom: '0.5rem', width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}
      >
        <Section>
          <SectionHeading style={{ margin: '0' }}>{`DPO`}</SectionHeading>
          <RowBetween>
            <div style={{ display: 'flex', verticalAlign: 'center' }}>
              <Heading style={{ margin: '0' }}>{dpoInfo.name}</Heading>
            </div>
            {isConnected ? (
              <CollapseWrapper>
                {passengerSeatCap &&
                  (!userMemberInfo ||
                    (userMemberInfo && userMemberInfo.number_of_seats.toNumber() < passengerSeatCap)) && (
                    <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                      <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={openJoinFormModal}>
                        {t(`Join`)}
                      </ButtonPrimary>
                    </ButtonWrapper>
                  )}
                <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                  <ButtonSecondary padding="0.45rem" fontSize="12px" onClick={openCrowdfundFormModal}>
                    {t(`Crowdfund`)}
                  </ButtonSecondary>
                </ButtonWrapper>
              </CollapseWrapper>
            ) : (
              <BorderedWrapper borderColor={theme.primary1} style={{ padding: '0.5rem', width: 'auto', margin: '0' }}>
                <HeavyText fontSize={'12px'} color={theme.primary1}>
                  {t(`Login for more`)}
                </HeavyText>
              </BorderedWrapper>
            )}
          </RowBetween>
        </Section>
        <Section>
          <RowBetween>
            {/* Action Shortcuts */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AnyQuestionHelper text={DPO_STATE_TOOLTIPS[dpoInfo.state.toString()]}>
                {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) ? (
                  <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                    {t(`EXPIRED`)}
                  </StateWrapper>
                ) : (
                  <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                    {dpoInfo.state.toString()}
                  </StateWrapper>
                )}
              </AnyQuestionHelper>
              {isConnected && userInDpo.inDpo && (
                <MemberWrapper style={{ background: membershipBg, width: 'auto', margin: '0.25rem' }}>
                  <StandardText fontSize={'12px'} color={'#fff'} style={{ textAlign: 'center' }}>
                    {userInDpo.role}
                  </StandardText>
                </MemberWrapper>
              )}
            </div>
            {projectState.selectedProject && wallet && wallet.address && (
              <CopyHelper
                toCopy={`${window.location.hostname}:${
                  window.location.port
                }/#/item/dpo/${dpoInfo.index.toString()}?ref=${wallet.address}&project=${
                  projectState.selectedProject.token
                }`}
                childrenIsIcon={true}
              >
                <IconWrapper>
                  <Share2 />
                </IconWrapper>
              </CopyHelper>
            )}
          </RowBetween>
        </Section>
        <Section style={{ marginTop: '1rem' }}>
          <HeavyText color={theme.primary1}>{t(`Rewards Received`)}</HeavyText>
          <StatDisplayContainer>
            <StatDisplayGrid>
              <StatContainer maxWidth="none" background={statsBg}>
                <StatValue>
                  {formatToUnit(dpoInfo.total_yield_received.toString(), chainDecimals, 2)}{' '}
                  <DataTokenName color="#fff">{token}</DataTokenName>
                </StatValue>
                <StatText>{t(`Yield`)}</StatText>
              </StatContainer>
              <StatContainer maxWidth="none" background={statsBg}>
                <StatValue>
                  {formatToUnit(dpoInfo.total_bonus_received.toString(), chainDecimals, 2)}{' '}
                  <DataTokenName color="#fff">{token}</DataTokenName>
                </StatValue>
                <StatText>{t(`Bonus`)}</StatText>
              </StatContainer>
              <StatContainer maxWidth="none" background={statsBg}>
                <StatValue>
                  {formatToUnit(dpoInfo.total_milestone_received.toString(), chainDecimals, 2)}{' '}
                  <DataTokenName color="#fff">{token}</DataTokenName>
                </StatValue>
                <StatText>{t(`Milestone`)}</StatText>
              </StatContainer>
            </StatDisplayGrid>
          </StatDisplayContainer>
        </Section>
      </FlatCard>
      {isConnected && (
        <ContentWrapper>
          <DpoActions dpoIndex={dpoIndex} />
        </ContentWrapper>
      )}
      <ContentWrapper>
        <FlatCard>
          <SectionHeading>{t(`Details`)}</SectionHeading>
          <SmallText>{t(`DPO Account Vault`)}</SmallText>
          <BorderedWrapper borderColor="#EC3D3D" style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`Bonus`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.vault_bonus, chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Yield`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Deposit`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.vault_deposit.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`General Information`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`DPO Id`)}</StandardText>
                <StandardText>{dpoIndex}</StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`DPO Name`)}</StandardText>
                <StandardText>{dpoInfo.name}</StandardText>
              </RowBetween>
              {dpoInfo.state.isCreated && (
                <RowBetween>
                  <StandardText>{t(`Ends`)}</StandardText>
                  <StandardText>
                    {t(`Block`)} #{dpoInfo.expiry_blk.toString()}
                  </StandardText>
                </RowBetween>
              )}
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Crowdfunding Information`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`Target`)}</StandardText>
                <StandardText>
                  <Link
                    to={{ pathname: `/item/${targetItem[0].toLowerCase()}/${targetItem[1]}` }}
                    style={{ textDecoration: 'none' }}
                  >
                    {dpoInfo.target.isTravelCabin && (
                      <>
                        {targetItem[0]} {getCabinClass(targetItem[1])}
                      </>
                    )}
                    {dpoInfo.target.isDpo && (
                      <>
                        {targetItem[0]} {targetItem[1]}
                      </>
                    )}
                  </Link>
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Amount`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Maturity`)}</StandardText>
                <StandardText>
                  {t(`Block`)} #{dpoInfo.target_maturity.toString()}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Bonus`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.target_bonus_estimate.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              {expectedBlockTime && (
                <RowBetween>
                  <StandardText>{t(`Yield`)}</StandardText>
                  <StandardText>
                    {`${formatToUnit(dpoInfo.target_yield_estimate.toString(), chainDecimals, 2)} ${token} (${getApy({
                      totalYield: dpoInfo.target_yield_estimate.toBn(),
                      totalDeposit: dpoInfo.target_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blocksInPeriod: expectedBlockTime,
                      period: dpoInfo.target_maturity,
                    }).toString()}% APY)`}
                  </StandardText>
                </RowBetween>
              )}
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`State Information`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`State`)}</StandardText>
                <StandardText>{dpoInfo.state.toString()}</StandardText>
              </RowBetween>
              {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) && (
                <RowBetween>
                  <StandardText>{t(`Expiry`)}</StandardText>
                  <StandardText>{t(`EXPIRED`)}</StandardText>
                </RowBetween>
              )}
            </Section>
            <Section>
              <StandardText>{t(`Seats Filled`)}</StandardText>
              <ProgressBar current={100 - dpoInfo.empty_seats.toNumber()} end={100} />
            </Section>
            <Section style={{ marginTop: '1rem' }}>
              <RowBetween>
                <StandardText>{t(`Available Seats`)}</StandardText>
                <StandardText>{dpoInfo.empty_seats.toString()}</StandardText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Membership Requirements`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`Managerial Commission`)}</StandardText>
                <StandardText>{dpoInfo.fee.toNumber() / 10}%</StandardText>
              </RowBetween>
              {dpoInfo.fee_slashed && (
                <RowBetween>
                  <StandardText>{t(`Manager Slashed`)}</StandardText>
                  <StandardText>{dpoInfo.fee_slashed.toString()}</StandardText>
                </RowBetween>
              )}
              <RowBetween>
                <StandardText>{t(`Cost per Seat`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.amount_per_seat.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Members`)}</SmallText>
          <ExpandCard title={t(`Members List`)} defaultExpanded={false} borderColor="#e6ebf2">
            <Section>
              <HeavyText fontSize="14px">{t(`Manager`)}</HeavyText>
              <RowBetween>
                <SmallText>{`${t(`Passenger`)}: `}</SmallText>
                <SmallText>{shortenAddr(dpoInfo.manager.toString(), 14)}</SmallText>
              </RowBetween>
            </Section>
            <Section>
              <HeavyText fontSize="14px">{t(`Members`)}</HeavyText>
              {dpoMembers.map((entry, index) => (
                <div key={index}>
                  {entry[1].buyer.isPassenger && (
                    <>
                      {!entry[1].buyer.asPassenger.eq(dpoInfo.manager.toString()) && (
                        <RowBetween key={index}>
                          <SmallText>{`${t(`Passenger`)}: `}</SmallText>
                          <CopyHelper toCopy={`${entry[1].buyer.asPassenger.toString()}`} childrenIsIcon={true}>
                            <SmallText>{shortenAddr(entry[1].buyer.asPassenger.toString(), 14)}</SmallText>
                          </CopyHelper>
                        </RowBetween>
                      )}
                    </>
                  )}
                  {entry[1].buyer.isDpo && (
                    <RowBetween key={index}>
                      <SmallText>DPO:</SmallText>
                      <CopyHelper toCopy={`${entry[1].buyer.asDpo.toString()}`} childrenIsIcon={true}>
                        <SmallText>{(entry[1].buyer.asDpo.toString(), 14)}</SmallText>
                      </CopyHelper>
                    </RowBetween>
                  )}
                </div>
              ))}
            </Section>
          </ExpandCard>
        </FlatCard>
      </ContentWrapper>
    </>
  )
}

export default function DpoItem(props: DpoItemProps): JSX.Element {
  const { dpoIndex } = props

  return <>{dpoIndex && <SelectedDpo dpoIndex={dpoIndex} />}</>
}
