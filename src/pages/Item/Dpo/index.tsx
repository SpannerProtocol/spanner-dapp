import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { FlatCard } from 'components/Card'
import ExpandCard from 'components/Card/ExpandCard'
import CopyHelper from 'components/Copy/Copy'
import Divider from 'components/Divider'
import { BorderedInput } from 'components/Input'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import { LinearProgressBar } from 'components/ProgressBar'
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
  StateWrapper,
} from 'components/Wrapper'
import useDpoFees from 'hooks/useDpoFees'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useDpoManager, useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
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
import { blocksToCountDown, blockToDays, daysToBlocks } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from 'utils/validAddress'
import { DAPP_HOST, DPO_STATE_COLORS, DPO_STATE_TOOLTIPS } from '../../../constants'
import getApy from '../../../utils/getApy'
import DpoActions from './actions'
import DpoModalForm from './Form'
import Highlights from './Highlights/index'
import TargetedBy from './TargetedBy'

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

interface JoinData {
  dpoIndex?: string
  targetSeats?: string
  referrer?: string | null
  newReferrer?: boolean
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
  baseFee?: string
  directReferralRate?: string
  end?: string
  referrer?: string | null
  newReferrer?: boolean
}

interface DpoCrowdfundTxConfirmProps extends CrowdfundData {
  target: string
  targetAmount: string
  token: string
  estimatedFee?: string
  dpoInfo: DpoInfo
}

function DpoCrowdfundTxConfirm({
  target,
  targetAmount,
  dpoName,
  token,
  targetSeats,
  managerSeats,
  baseFee,
  directReferralRate,
  end,
  estimatedFee,
  dpoInfo,
  referrer,
  newReferrer,
}: DpoCrowdfundTxConfirmProps) {
  const { t } = useTranslation()
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const { chainDecimals } = useSubstrate()

  const endInDays =
    end && expectedBlockTime && lastBlock
      ? Math.ceil(parseFloat(blockToDays(new BN(end).sub(lastBlock), expectedBlockTime, 4))).toString()
      : undefined

  return (
    <>
      <Section>
        <StandardText>{t(`Verify DPO details`)}</StandardText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <StandardText>{t(`Default Target`)}</StandardText>
          <StandardText>{target}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`DPO Name`)}</StandardText>
          <StandardText>{dpoName}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Crowdfund Amount`)}</StandardText>
          <StandardText>
            {targetAmount} {token}
          </StandardText>
        </RowBetween>
        {end && endInDays && (
          <RowBetween>
            <StandardText>{t(`Crowdfund Period`)}</StandardText>
            <StandardText fontSize="12px">{`~${t(`Block`)} #${end} (${endInDays} ${t(`days`)})`}</StandardText>
          </RowBetween>
        )}
        <RowBetween>
          <StandardText>{t(`Target DPO Seats`)}</StandardText>
          <StandardText>{targetSeats}</StandardText>
        </RowBetween>
        {managerSeats && baseFee && (
          <RowBetween>
            <StandardText>{t(`Management Fee`)}</StandardText>
            <StandardText>
              {`${baseFee} (${t(`Base`)}) + ${managerSeats} (${t(`Seats`)}) = ${Math.round(
                parseFloat(managerSeats) + parseFloat(baseFee)
              ).toString()}%`}
            </StandardText>
          </RowBetween>
        )}
        {directReferralRate && (
          <>
            <RowBetween>
              <StandardText>{t(`Direct Referral Rate`)}</StandardText>
              <StandardText>
                {`${directReferralRate} (${t(`Direct`)}) + ${100 - parseInt(directReferralRate)} (${t(`2nd`)}) = 100%`}
              </StandardText>
            </RowBetween>
          </>
        )}
        <Divider />
        {managerSeats && targetSeats && (
          <RowBetween>
            <HeavyText fontSize="14px">{t(`Required deposit`)}</HeavyText>
            <HeavyText fontSize="14px">
              {`${formatToUnit(
                new BN(managerSeats).mul(new BN(targetSeats).mul(dpoInfo.amount_per_seat).div(new BN(100))),
                chainDecimals,
                2
              )} 
              ${token}`}
            </HeavyText>
          </RowBetween>
        )}
      </BorderedWrapper>
      {newReferrer && referrer && (
        <BorderedWrapper>
          <RowBetween>
            <StandardText>{t(`Referral Code`)}</StandardText>
            <StandardText>{shortenAddr(referrer, 5)}</StandardText>
          </RowBetween>
        </BorderedWrapper>
      )}
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

function DpoJoinTxConfirm({ targetSeats, deposit, estimatedFee, token, referrer, newReferrer }: DpoJoinTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Confirm the details below.`)}</StandardText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <StandardText>{t(`Seats`)}</StandardText>
          <StandardText>{targetSeats}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Deposit`)}</StandardText>
          <StandardText>
            {deposit} {token}
          </StandardText>
        </RowBetween>
        {newReferrer && referrer && (
          <RowBetween>
            <StandardText>{t(`Referral Code`)}</StandardText>
            <StandardText>{shortenAddr(referrer, 5)}</StandardText>
          </RowBetween>
        )}
      </BorderedWrapper>
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

function DpoJoinForm({ dpoInfo, token, chainDecimals, onSubmit }: DpoJoinFormProps) {
  const [seats, setSeats] = useState<number>(1)
  const [referralCode, setReferralCode] = useState<string | null>('')
  const referrer = useReferrer()
  const { t } = useTranslation()
  const { passengerSeatCap } = useConsts()
  const balance = useSubscribeBalance(token)
  const [newReferrer, setNewReferrer] = useState<boolean>(false)

  // This is only onChange
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
    if (!passengerSeatCap) return
    if (value < 1 || value > passengerSeatCap) return
    setSeats(value)
  }

  const handleSubmit = () => {
    let validatedReferrer: null | string = null
    if (typeof referralCode === 'string' && isValidSpannerAddress(referralCode)) {
      validatedReferrer = referralCode
    }
    onSubmit({ seats, referrer: validatedReferrer, newReferrer })
  }

  // if the user had a stored referrer, set it
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
      <BorderedWrapper>
        <RowBetween>
          <StandardText>{t(`Balance`)}</StandardText>
          <StandardText>
            {formatToUnit(balance, chainDecimals, 2)} {token}
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
            <StandardText>{t(`Total Seat Price`)}</StandardText>
            <QuestionHelper
              text={t(`The total cost of Seats to buy from this DPO.`)}
              size={12}
              backgroundColor={'#fff'}
            ></QuestionHelper>
          </RowFixed>
          <StandardText>
            {formatToUnit(new BN(seats).mul(dpoInfo.amount_per_seat), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
      </BorderedWrapper>
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
          type="number"
          placeholder={`1 - ${passengerSeatCap}`}
          onChange={(e) => handleSeats(e)}
          value={Number.isNaN(seats) ? '' : seats}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </Section>
      {(!referralCode || newReferrer) && (
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
  const isConnected = useIsConnected()
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const { projectState } = useProjectManager()
  const [txInfo, setTxInfo] = useState<TxInfo>({})
  const { t } = useTranslation()
  const { passengerSeatCap } = useConsts()
  const manager = useDpoManager(dpoIndex, dpoInfo)
  const theme = useContext(ThemeContext)
  const fees = useDpoFees(dpoIndex)

  const { createTx, submitTx } = useTxHelpers()

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

  const handleJoinFormCallback = ({
    referrer,
    seats,
    newReferrer,
  }: {
    referrer: string | null
    seats: string
    newReferrer: boolean
  }) => {
    if (!dpoIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    setJoinData({ dpoIndex, targetSeats: seats, referrer, newReferrer })
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
    newReferrer,
  }: {
    dpoName: string
    seats: string
    managerSeats: string
    baseFee: number
    directReferralRate: number
    end: number
    referrer: string | null
    newReferrer: boolean
  }) => {
    if (!lastBlock || !expectedBlockTime) {
      return
    }
    const daysBlocks = daysToBlocks(end, expectedBlockTime)
    const endBlock = lastBlock.add(daysBlocks)
    setCrowdfundData({
      dpoName,
      targetSeats: seats.toString(),
      managerSeats: managerSeats.toString(),
      baseFee: baseFee.toString(),
      directReferralRate: directReferralRate.toString(),
      end: endBlock.toString(),
      referrer,
      newReferrer,
    })
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
        end: endBlock.toString(),
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
  const dirRefRate = dpoInfo.direct_referral_rate.toNumber() / 10
  let expiry = new BN(0)
  if (lastBlock) {
    expiry = dpoInfo.expiry_blk.sub(lastBlock).isNeg() ? new BN(0) : dpoInfo.expiry_blk.sub(lastBlock)
  }

  return (
    <>
      <StandardModal title={t(`Join DPO`)} isOpen={joinFormModalOpen} onDismiss={dismissModal} desktopScroll={true}>
        <DpoJoinForm dpoInfo={dpoInfo} token={token} chainDecimals={chainDecimals} onSubmit={handleJoinFormCallback} />
      </StandardModal>
      <DpoModalForm
        targetType={'DPO'}
        dpoInfo={dpoInfo}
        isOpen={crowdfundFormModalOpen}
        onDismiss={dismissModal}
        onSubmit={handleCrowdfundFormCallback}
      />
      <TxModal
        isOpen={joinTxModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Join DPO`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <DpoJoinTxConfirm
          targetSeats={joinData.targetSeats}
          referrer={joinData.referrer}
          newReferrer={joinData.newReferrer}
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
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Create DPO`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <DpoCrowdfundTxConfirm
          target={dpoInfo.name.toString()}
          dpoName={crowdfundData.dpoName}
          managerSeats={crowdfundData.managerSeats}
          targetSeats={crowdfundData.targetSeats}
          end={crowdfundData.end}
          baseFee={crowdfundData.baseFee}
          directReferralRate={crowdfundData.directReferralRate}
          referrer={crowdfundData.referrer}
          newReferrer={crowdfundData.newReferrer}
          targetAmount={formatToUnit(
            dpoInfo.amount_per_seat.toBn().mul(new BN(crowdfundData.targetSeats ? crowdfundData.targetSeats : 0)),
            chainDecimals,
            2
          )}
          token={token}
          estimatedFee={txInfo.estimatedFee}
          dpoInfo={dpoInfo}
        />
      </TxModal>
      <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
                    (userMemberInfo && userMemberInfo.number_of_seats.toNumber() < passengerSeatCap)) &&
                  dpoInfo.state.isCreated && (
                    <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                      <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={openJoinFormModal}>
                        {t(`Join`)}
                      </ButtonPrimary>
                    </ButtonWrapper>
                  )}
                {dpoInfo.state.isCreated && dpoInfo.empty_seats.gt(new BN(0)) && (
                  <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                    <ButtonSecondary padding="0.45rem" fontSize="12px" onClick={openCrowdfundFormModal}>
                      {t(`Crowdfund`)}
                    </ButtonSecondary>
                  </ButtonWrapper>
                )}
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
                    {t(dpoInfo.state.toString())}
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
                toCopy={`${DAPP_HOST}/#/item/dpo/${dpoInfo.index.toString()}?ref=${wallet.address}&project=${
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
        {!dpoInfo.state.isCreated && (
          <Section style={{ marginTop: '1rem' }}>
            <HeavyText color={theme.primary1}>{t(`Total Rewards Received`)}</HeavyText>
            <StatDisplayContainer>
              <StatDisplayGrid>
                <StatContainer maxWidth="none" background={statsBg}>
                  <StatValue small={true}>
                    {formatToUnit(dpoInfo.total_yield_received.toString(), chainDecimals, 2)}{' '}
                    <DataTokenName color="#fff" mobileFontSize="8px">
                      {token}
                    </DataTokenName>
                  </StatValue>
                  <StatText>{t(`Yield`)}</StatText>
                </StatContainer>
                <StatContainer maxWidth="none" background={statsBg}>
                  <StatValue small={true}>
                    {formatToUnit(dpoInfo.total_bonus_received.toString(), chainDecimals)}{' '}
                    <DataTokenName color="#fff" mobileFontSize="8px">
                      {token}
                    </DataTokenName>
                  </StatValue>
                  <StatText>{t(`Bonus`)}</StatText>
                </StatContainer>
                {dpoInfo.target.isTravelCabin && (
                  <StatContainer maxWidth="none" background={statsBg}>
                    <StatValue small={true}>
                      {formatToUnit(dpoInfo.total_milestone_received.toString(), chainDecimals, 2)}{' '}
                      <DataTokenName color="#fff" mobileFontSize="8px">
                        {token}
                      </DataTokenName>
                    </StatValue>
                    <StatText>{t(`Milestone`)}</StatText>
                  </StatContainer>
                )}
              </StatDisplayGrid>
            </StatDisplayContainer>
          </Section>
        )}
      </FlatCard>
      <Highlights dpoInfo={dpoInfo} />
      {isConnected && <DpoActions dpoIndex={dpoIndex} />}
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
              <RowBetween>
                <StandardText>{t(`Withdraw`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.vault_withdraw.toString(), chainDecimals, 2)} {token}
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
              {dpoInfo.state.isCreated && expiry && expectedBlockTime && (
                <RowBetween>
                  <StandardText>{t(`Crowdfunding Ends`)}</StandardText>
                  <StandardText>{blocksToCountDown(expiry, expectedBlockTime, t(`Expired`))}</StandardText>
                </RowBetween>
              )}
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Crowdfunding Information`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              <RowBetween>
                <StandardText>{t(`Target`)}</StandardText>
                {dpoInfo.target.isTravelCabin && (
                  <Link to={`/item/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`}>
                    <StandardText color={theme.blue2}>
                      {t(`TravelCabin`)} {dpoInfo.target.asTravelCabin.toString()}
                    </StandardText>
                  </Link>
                )}
                {dpoInfo.target.isDpo && (
                  <Link to={`/item/dpo/${dpoInfo.target.asDpo[0].toString()}`}>
                    <StandardText color={theme.blue2}>
                      {t(`DPO`)} {dpoInfo.target.asDpo[0].toString()}
                    </StandardText>
                  </Link>
                )}
              </RowBetween>
              {dpoInfo.target.isDpo && (
                <RowBetween>
                  <StandardText>{t(`Seats Purchased`)}</StandardText>
                  <StandardText>{dpoInfo.target.asDpo[1].toString()}</StandardText>
                </RowBetween>
              )}
              <RowBetween>
                <StandardText>{t(`Amount`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.target_amount.toString(), chainDecimals)} {token}
                </StandardText>
              </RowBetween>
              {expectedBlockTime && (
                <RowBetween>
                  <StandardText>{t(`Maturity`)}</StandardText>
                  <StandardText>
                    {`${t(`Block`)} #${formatToUnit(dpoInfo.target_maturity.toString(), 0)} (${blockToDays(
                      dpoInfo.target_maturity,
                      expectedBlockTime,
                      2
                    )} ${t(`days`)})`}
                  </StandardText>
                </RowBetween>
              )}
              <RowBetween>
                <StandardText>{t(`Bonus`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.target_bonus_estimate.toString(), chainDecimals)} {token}
                </StandardText>
              </RowBetween>
              {expectedBlockTime && (
                <RowBetween>
                  <StandardText>{t(`Yield`)}</StandardText>
                  <StandardText>
                    {`${formatToUnit(dpoInfo.target_yield_estimate.toString(), chainDecimals)} ${token} (${getApy({
                      totalYield: dpoInfo.target_yield_estimate.toBn(),
                      totalDeposit: dpoInfo.target_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blockTime: expectedBlockTime,
                      period: dpoInfo.target_maturity,
                      precision: 2,
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
                <StandardText>{t(dpoInfo.state.toString())}</StandardText>
              </RowBetween>
              {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) && (
                <RowBetween>
                  <StandardText>{t(`Crowdfund Period`)}</StandardText>
                  <StandardText>{t(`EXPIRED`)}</StandardText>
                </RowBetween>
              )}
            </Section>
            <Section>
              <RowBetween style={{ paddingBottom: '0.25rem' }}>
                <StandardText>{t(`Seats Filled`)}</StandardText>
                <StandardText>{`${100 - dpoInfo.empty_seats.toNumber()} / 100`}</StandardText>
              </RowBetween>
              <LinearProgressBar value={100 - dpoInfo.empty_seats.toNumber()} />
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Membership Requirements`)}</SmallText>
          <BorderedWrapper style={{ marginTop: '0' }}>
            <Section>
              {fees && (
                <RowBetween>
                  <StandardText>{t(`Management Fee`)}</StandardText>
                  <StandardText>{`${fees.base} (${t(`Base`)}) + ${fees.management} (${t(`Seats`)}) = ${
                    dpoInfo.fee.toNumber() / 10
                  }%`}</StandardText>
                </RowBetween>
              )}
              {dpoInfo.fee_slashed && (
                <RowBetween>
                  <StandardText>{t(`Manager Slashed`)}</StandardText>
                  <StandardText>{dpoInfo.fee_slashed.isTrue ? t(`Yes`) : t(`No`)}</StandardText>
                </RowBetween>
              )}
              <RowBetween>
                <StandardText>{t(`Cost per Seat`)}</StandardText>
                <StandardText>
                  {formatToUnit(dpoInfo.amount_per_seat.toString(), chainDecimals, 2)} {token}
                </StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Direct Referral Rate`)}</StandardText>
                <StandardText>{`${dirRefRate} (${t(`Direct`)}) + ${100 - dirRefRate} (${t(
                  `2nd`
                )}) = 100%`}</StandardText>
              </RowBetween>
            </Section>
          </BorderedWrapper>
          <SmallText>{t(`Members`)}</SmallText>
          <ExpandCard title={t(`Members List`)} defaultExpanded={false} borderColor="#e6ebf2">
            {manager && (
              <Section>
                <HeavyText fontSize="14px">{t(`Manager`)}</HeavyText>
                <RowBetween>
                  <SmallText>{`${t(`Passenger`)}: `}</SmallText>
                  <CopyHelper toCopy={`${manager.buyer.asPassenger.toString()}`} childrenIsIcon={true}>
                    <SmallText>
                      {`${shortenAddr(
                        manager.buyer.asPassenger.toString(),
                        8
                      )} (${manager.number_of_seats.toString()} ${t(`Seats`)})`}
                    </SmallText>
                  </CopyHelper>
                </RowBetween>
              </Section>
            )}
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
                            <SmallText>
                              {`${shortenAddr(
                                entry[1].buyer.asPassenger.toString(),
                                8
                              )} (${entry[1].number_of_seats.toString()} ${t(`Seats`)})`}
                            </SmallText>
                          </CopyHelper>
                        </RowBetween>
                      )}
                    </>
                  )}
                  {entry[1].buyer.isDpo && (
                    <RowBetween key={index}>
                      <SmallText>DPO:</SmallText>
                      <CopyHelper toCopy={`${entry[1].buyer.asDpo.toString()}`} childrenIsIcon={true}>
                        <SmallText>
                          {`${entry[1].buyer.asDpo.toString()} (${entry[1].number_of_seats.toString()} ${t(`Seats`)})`}
                        </SmallText>
                      </CopyHelper>
                    </RowBetween>
                  )}
                </div>
              ))}
            </Section>
          </ExpandCard>
        </FlatCard>
      </ContentWrapper>
      <TargetedBy dpoInfo={dpoInfo} />
    </>
  )
}

export default function DpoItem(props: DpoItemProps): JSX.Element {
  const { dpoIndex } = props

  return <>{dpoIndex && <SelectedDpo dpoIndex={dpoIndex} />}</>
}
