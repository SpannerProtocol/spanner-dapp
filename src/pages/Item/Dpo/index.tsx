import BN from 'bn.js'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { FlatCardPlate } from 'components/Card'
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
import { useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
import { useQuerySubscribeDpo } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { useUserInDpo } from 'hooks/useUser'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useContext, useEffect, useState } from 'react'
import { Share2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-interfaces/types'
import { useProjectManager } from 'state/project/hooks'
import { useReferrerManager } from 'state/referrer/hooks'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { DPO_STATE_TOOLTIPS } from '../../../constants'
import getApy from '../../../utils/getApy'
import getCabinClass from '../../../utils/getCabinClass'
import truncateString from '../../../utils/truncateString'
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
  const [dpoName, setDpoName] = useState<string | null>('')
  const [end, setEnd] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const { referrerState } = useReferrerManager()
  const { projectState } = useProjectManager()
  const { t } = useTranslation()

  const referrer = referrerState.referrer
  const project = projectState.selectedProject

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

  const handleSubmit = () => onSubmit({ seats, managerSeats, end, dpoName, referrer: referralCode })

  useEffect(() => {
    if (!referralCode && referrer && project && referrer[project.token.toUpperCase()]) {
      setReferralCode(referrer[project.token.toUpperCase()].referrer)
    }
  }, [project, referralCode, referrer])

  return (
    <>
      <Section>
        <StandardText>{t(`Create another DPO to Crowdfund for this DPO's fundraising target.`)}</StandardText>
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
              `The # of Seats you wish to buy from THIS DPO will determine the crowdfunding target of YOUR new DPO. The crowdfunding target will be split equally to 100 seats for your DPO members.`
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
        {referralCode && referrer && project && referrer[project.token.toUpperCase()] ? (
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="e.g. 5F3A9CA..."
            defaultValue={referralCode}
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
            disabled
          />
        ) : (
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="A3FDHC..."
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        )}
      </Section>
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
        <StandardText>{t(`Create a DPO to Crowdfund for this TravelCabin.`)}</StandardText>
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
        <RowBetween>
          <StandardText>{t(`Manager Seats`)}</StandardText>
          <StandardText>{props.managerSeats}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`End Block`)}</StandardText>
          <StandardText>{props.end}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Referral Code`)}</StandardText>
          {props.referrer ? (
            <StandardText>{truncateString(props.referrer)}</StandardText>
          ) : (
            <StandardText>{t(`None`)}</StandardText>
          )}
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
        {props.referrer && props.referrer !== null && (
          <RowBetween>
            <StandardText>{t(`Referral Code`)}</StandardText>
            <StandardText>{truncateString(props.referrer)}</StandardText>
          </RowBetween>
        )}
      </SpacedSection>
      <TxFee fee={props.estimatedFee} />
    </>
  )
}

function DpoJoinForm({ dpoInfo, token, chainDecimals, onSubmit }: DpoJoinFormProps) {
  const [seats, setSeats] = useState<string>('')
  const [referralCode, setReferralCode] = useState<string | null>('')
  const { referrerState } = useReferrerManager()
  const { projectState } = useProjectManager()
  const { t } = useTranslation()

  const referrer = referrerState.referrer
  const project = projectState.selectedProject

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
    if (!referralCode && referrer && project && referrer[project.token.toUpperCase()]) {
      setReferralCode(referrer[project.token.toUpperCase()].referrer)
    }
  }, [project, referralCode, referrer])

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
        {referralCode && referrer && project && referrer[project.token.toUpperCase()] ? (
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="e.g. 5F3A9CA..."
            defaultValue={referralCode}
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
            disabled
          />
        ) : (
          <BorderedInput
            required
            id="dpo-referrer"
            type="string"
            placeholder="e.g. 5F3A9CA..."
            onChange={(e) => handleReferralCode(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
          />
        )}
      </Section>
      <Section style={{ marginTop: '1rem' }}>
        <ButtonPrimary onClick={handleSubmit}>{t(`Join`)}</ButtonPrimary>
      </Section>
    </>
  )
}

function SelectedDpo({ dpoIndex }: DpoItemProps): JSX.Element {
  const dpoInfo = useQuerySubscribeDpo(dpoIndex)
  const dpoMembers = useQueryDpoMembers(dpoIndex)
  const wallet = useWallet()
  const [targetItem, setTargetItem] = useState<[string, string]>(['', ''])
  const { chainDecimals } = useSubstrate()
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
    end,
    referrer,
  }: {
    dpoName: string
    seats: string
    managerSeats: string
    end: number
    referrer: string
  }) => {
    setCrowdfundData({ dpoName, targetSeats: seats, managerSeats, end, referrer })
    if (!dpoIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    const txData = createTx({
      section: 'bulletTrain',
      method: 'createDpo',
      params: { name: dpoName, target: { Dpo: [dpoIndex, seats] }, managerSeats, end, referrer },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))

    openCrowdfundTxModal()
  }

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
      <FlatCardPlate
        style={{ marginBottom: '0.5rem', width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}
      >
        <Section>
          <SectionHeading style={{ margin: '0' }}>{`DPO`}</SectionHeading>
          <RowBetween>
            <div style={{ display: 'flex', verticalAlign: 'center' }}>
              <Heading style={{ margin: '0' }}>{dpoInfo.name}</Heading>
            </div>
            {isConnected ? (
              <>
                {!userInDpo.inDpo ? (
                  <CollapseWrapper>
                    <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                      <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={openJoinFormModal}>
                        {t(`Join`)}
                      </ButtonPrimary>
                    </ButtonWrapper>
                    <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                      <ButtonSecondary padding="0.45rem" fontSize="12px" onClick={openCrowdfundFormModal}>
                        {t(`Crowdfund`)}
                      </ButtonSecondary>
                    </ButtonWrapper>
                  </CollapseWrapper>
                ) : (
                  <MemberWrapper style={{ background: membershipBg, width: 'auto', margin: '0' }}>
                    <StandardText fontSize={'12px'} color={'#fff'}>
                      {userInDpo.role}
                    </StandardText>
                  </MemberWrapper>
                )}
              </>
            ) : (
              <BorderedWrapper borderColor={theme.primary1} style={{ padding: '0.5rem', width: 'auto', margin: '0' }}>
                <HeavyText fontSize={'12px'} color={theme.primary1}>
                  {t(`Login for more`)}
                </HeavyText>
              </BorderedWrapper>
            )}
          </RowBetween>
        </Section>
        <Section style={{ marginTop: '1rem' }}>
          <RowBetween>
            {/* Action Shortcuts */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AnyQuestionHelper text={DPO_STATE_TOOLTIPS[dpoInfo.state.toString()]}>
                <StateWrapper color={'#fff'} background={theme.secondary1}>
                  {dpoInfo.state.toString()}
                </StateWrapper>
              </AnyQuestionHelper>
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
      </FlatCardPlate>
      {isConnected && (
        <ContentWrapper>
          <DpoActions dpoIndex={dpoIndex} />
        </ContentWrapper>
      )}
      <ContentWrapper>
        <FlatCardPlate>
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
                <StandardText>{t(`Fare Deposit`)}</StandardText>
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
              {dpoInfo.state.eq('CREATED') && (
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
                <StandardText>{t(`Crowdfunding Amount`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Target Maturity`)}</StandardText>
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
                <StandardText>{dpoInfo.commission_rate.toNumber() / 10}%</StandardText>
              </RowBetween>
              {dpoInfo.commission_rate_slashed && (
                <RowBetween>
                  <StandardText>{t(`Manager Slashed`)}</StandardText>
                  <StandardText>{dpoInfo.commission_rate_slashed.toString()}</StandardText>
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
              <RowBetween style={{ display: 'block' }}>
                <StandardText>{t(`Manager`)}</StandardText>
                <SmallText>{dpoInfo.manager.toString()}</SmallText>
              </RowBetween>
            </Section>
            <Section>
              <RowBetween style={{ display: 'block' }}>
                <StandardText>{t(`Members`)}</StandardText>
                {dpoMembers.map((entry, index) => (
                  <div key={index}>
                    {entry[1].buyer.isPassenger && (
                      <>
                        {!entry[1].buyer.asPassenger.eq(dpoInfo.manager.toString()) && (
                          <SmallText key={index}>{entry[1].buyer.asPassenger.toString()}</SmallText>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </RowBetween>
            </Section>
          </ExpandCard>
        </FlatCardPlate>
      </ContentWrapper>
    </>
  )
}

export default function DpoItem(props: DpoItemProps): JSX.Element {
  const { dpoIndex } = props

  return <>{dpoIndex && <SelectedDpo dpoIndex={dpoIndex} />}</>
}
