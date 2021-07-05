import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import CopyHelper from 'components/Copy/Copy'
import Divider from 'components/Divider'
import { EvenGrid } from 'components/Grid'
import { SHashLink, SLink } from 'components/Link'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import { StateOverlay } from 'components/Overlay'
import { CircleProgress } from 'components/ProgressBar'
import { RowBetween, RowBlock, RowFixed } from 'components/Row'
import { Header2, Header4, HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, CenterWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import useDpoFees from 'hooks/useDpoFees'
import { useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, DpoMemberInfo } from 'spanner-interfaces/types'
import isDpoStateCompleted, { isDpoStateSelectedState } from 'utils/dpoStateCompleted'
import { blocksToCountDown, blockToDays, daysToBlocks, formatBlocksCountdown } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import getApy from 'utils/getApy'
import { shortenAddr } from 'utils/truncateString'
import useTheme from 'utils/useTheme'
import DpoActions from '.'
import { DAPP_HOST } from '../../../../constants'
import FormBuyDpoSeats from '../FormBuyDpoSeats'
import FormCreateDpo from '../FormCreateDpo'
import TargetedBy from '../TargetedBy'
import Skeleton from 'react-loading-skeleton'

interface BuyData {
  dpoIndex?: string
  targetSeats?: string
  referrer?: string | null
  newReferrer?: boolean
}

interface DpoBuyTxConfirmProps extends BuyData {
  deposit: string
  token: string
  estimatedFee?: string
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

interface DpoCreateDpoTxConfirmProps extends CreateDpoData {
  target: string
  targetAmount: string
  token: string
  estimatedFee?: string
  dpoInfo: DpoInfo
}

function DpoCreateDpoTxConfirm({
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
}: DpoCreateDpoTxConfirmProps) {
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
            {targetAmount} {token}
          </SText>
        </RowBetween>
        {end && endInDays && (
          <RowBetween>
            <SText>{t(`Crowdfund Period`)}</SText>
            <SText>{`${endInDays} ${t(`days`)}`}</SText>
          </RowBetween>
        )}
        <RowBetween>
          <SText>{t(`Target DPO Seats`)}</SText>
          <SText>{targetSeats}</SText>
        </RowBetween>
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
            <SText>{t(`Referral Code`)}</SText>
            <SText>{shortenAddr(referrer, 5)}</SText>
          </RowBetween>
        </BorderedWrapper>
      )}
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

function DpoBuyTxConfirm({ targetSeats, deposit, estimatedFee, token, referrer, newReferrer }: DpoBuyTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <SText>{t(`Confirm the details below.`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`Seats`)}</SText>
          <SText>{targetSeats}</SText>
        </RowBetween>
        <RowBetween>
          <SText>{t(`Deposit`)}</SText>
          <SText>
            {deposit} {token}
          </SText>
        </RowBetween>
        {newReferrer && referrer && (
          <RowBetween>
            <SText>{t(`Referral Code`)}</SText>
            <SText>{shortenAddr(referrer, 5)}</SText>
          </RowBetween>
        )}
      </BorderedWrapper>
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
}

function CreateHighlights({
  dpoInfo,
  onBuy,
  onCreateDpo,
}: {
  dpoInfo: DpoInfo
  onBuy: () => void
  onCreateDpo: () => void
}) {
  const progress = 100 - dpoInfo.empty_seats.toNumber()
  const { chainDecimals } = useSubstrate()
  const token = dpoInfo.token_id.asToken.toString()
  const { t } = useTranslation()
  const fees = useDpoFees(dpoInfo.index.toString())
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const theme = useTheme()

  const isConnected = useIsConnected()
  const { passengerSeatCap } = useConsts()
  const dpoMembers = useQueryDpoMembers(dpoInfo.index.toString())
  const [userMemberInfo, setUserMemberInfo] = useState<DpoMemberInfo>()
  const wallet = useWallet()

  useEffect(() => {
    if (!wallet || !wallet.address || !dpoMembers || dpoMembers.length === 0) return
    const memberInfo = dpoMembers.find(
      (entry) => entry[1].buyer.isPassenger && entry[1].buyer.asPassenger.eq(wallet.address)
    )
    setUserMemberInfo(memberInfo ? memberInfo[1] : undefined)
  }, [dpoMembers, wallet])

  const apy = useMemo(
    () =>
      expectedBlockTime &&
      getApy({
        totalYield: dpoInfo.target_yield_estimate.toBn(),
        totalDeposit: dpoInfo.target_amount.toBn(),
        chainDecimals: chainDecimals,
        blockTime: expectedBlockTime,
        maturity: dpoInfo.target_maturity,
        precision: 2,
      }),
    [dpoInfo, chainDecimals, expectedBlockTime]
  )

  const expiry = useMemo(() => {
    let expiryBlk = new BN(0)
    if (lastBlock) {
      expiryBlk = dpoInfo.expiry_blk.sub(lastBlock).isNeg() ? new BN(0) : dpoInfo.expiry_blk.sub(lastBlock)
    }
    return expiryBlk
  }, [dpoInfo, lastBlock])

  const dirRefRate = useMemo(() => dpoInfo.direct_referral_rate.toNumber() / 10, [dpoInfo])

  return (
    <>
      <EvenGrid columns="2" mobileColumns="2">
        <CenterWrapper>
          <RowBlock width="fit-content" padding="0 1rem">
            <SText>{t(`Seats Filled`)}</SText>
            <div style={{ margin: '0.25rem auto', maxWidth: '200px' }}>
              <CircleProgress value={progress} size={40} thickness={6} displayFilled={false} mobileFontSize="9px" />
            </div>
          </RowBlock>
        </CenterWrapper>
        {expectedBlockTime && dpoInfo.state.isCreated && !expiry.isZero() ? (
          <CenterWrapper>
            <RowBlock width="fit-content" padding="0 1rem">
              <SText width="100%" textAlign="center" padding="0 0.5rem">
                {t(`Time left`)}
              </SText>
              <HeavyText color={formatBlocksCountdown(expiry, expectedBlockTime, theme)}>
                {blocksToCountDown(expiry, expectedBlockTime, t(`Expired`), ['s'])}
              </HeavyText>
            </RowBlock>
          </CenterWrapper>
        ) : (
          <CenterWrapper>
            <RowBlock width="fit-content" padding="0 1rem">
              <SText width="100%" textAlign="center" padding="0 0.5rem">
                {t(`Time left`)}
              </SText>
              <HeavyText width="100%" textAlign="center">
                {t(`Crowdfunding period over`)}
              </HeavyText>
            </RowBlock>
          </CenterWrapper>
        )}
      </EvenGrid>
      <Divider />
      <EvenGrid columns="2" mobileColumns="2" rows="4" mobileRows="4">
        <CenterWrapper>
          <RowBlock>
            <SText width="100%" textAlign="center">
              {t(`APY`)}
            </SText>
            <HeavyText fontSize="24px" mobileFontSize="18px" width="100%" textAlign="center">
              {`${apy}%`}
            </HeavyText>
          </RowBlock>
        </CenterWrapper>
        <CenterWrapper>
          <RowBlock>
            <SText width="100%" textAlign="center">
              {t(`Bonus`)}
            </SText>
            <RowFixed width="100%" justifyContent="center" align="baseline">
              <HeavyText fontSize="24px" mobileFontSize="18px">
                {`${formatToUnit(dpoInfo.target_bonus_estimate.toBn(), chainDecimals)} `}
              </HeavyText>
              <TokenText padding="0 0 0 0.25rem">{token}</TokenText>
            </RowFixed>
          </RowBlock>
        </CenterWrapper>
        <CenterWrapper>
          <RowBlock>
            <SText width="100%" textAlign="center">
              {t(`Cost per Seat`)}
            </SText>
            <RowFixed width="100%" justifyContent="center" align="baseline">
              <HeavyText fontSize="24px" mobileFontSize="18px">
                {`${formatToUnit(dpoInfo.amount_per_seat.toString(), chainDecimals)} `}
              </HeavyText>
              <TokenText padding="0 0 0 0.25rem">{token}</TokenText>
            </RowFixed>
          </RowBlock>
        </CenterWrapper>
        <CenterWrapper>
          <RowBlock>
            <SText width="100%" textAlign="center">
              {t(`Direct Referral Rate`)}
            </SText>
            <RowFixed width="100%" justifyContent="center" align="baseline">
              <HeavyText fontSize="24px" mobileFontSize="18px">
                {`${dirRefRate}%`}
              </HeavyText>
            </RowFixed>
          </RowBlock>
        </CenterWrapper>
        {fees ? (
          <CenterWrapper>
            <RowBlock>
              <SText width="100%" textAlign="center">
                {t(`Management Fee`)}
              </SText>
              <HeavyText fontSize="24px" mobileFontSize="18px" width="100%" textAlign="center">
                {dpoInfo.fee.toNumber() / 10}%
              </HeavyText>
              <SText width="100%" textAlign="center" fontSize="12px" mobileFontSize="10px">
                {`${fees.base} ${t(`Base`)} + ${fees.management} ${t(`Seats`)}`}
              </SText>
            </RowBlock>
          </CenterWrapper>
        ) : (
          <div style={{ display: 'block' }}>
            <Skeleton height={10} count={1} style={{ margin: '0.1rem 0' }} />
            <Skeleton height={25} count={1} style={{ margin: '0.1rem 0' }} />
            <Skeleton height={10} count={1} style={{ margin: '0.1rem 0' }} />
          </div>
        )}
        <CenterWrapper>
          <RowBlock>
            <SText width="100%" textAlign="center">
              {t(`2nd ° Referral Rate`)}
            </SText>
            <RowFixed width="100%" justifyContent="center" align="baseline">
              <HeavyText fontSize="24px" mobileFontSize="18px">
                {`${100 - dirRefRate}%`}
              </HeavyText>
            </RowFixed>
          </RowBlock>
        </CenterWrapper>
        {passengerSeatCap && (
          <CenterWrapper>
            <ButtonPrimary
              mobileMinWidth="120px"
              maxHeight="31px"
              margin="0 1rem"
              width="100%"
              onClick={onBuy}
              disabled={
                (dpoInfo.state.isCreated &&
                  userMemberInfo &&
                  userMemberInfo.number_of_seats.toNumber() < passengerSeatCap) ||
                (dpoInfo.state.isCreated && !userMemberInfo)
                  ? false
                  : true || !isConnected
              }
            >
              {t(`Buy`)}
            </ButtonPrimary>
          </CenterWrapper>
        )}
        {wallet && wallet.address && (
          <CenterWrapper>
            <CopyHelper
              toCopy={`${DAPP_HOST}/#/dpos/dpo/${dpoInfo.index.toString()}/activity?ref=${
                wallet.address
              }&project=${dpoInfo.token_id.asToken.toString()}`}
              childrenIsIcon={true}
              width="100%"
            >
              <ButtonSecondary
                mobileMinWidth="120px"
                maxHeight="31px"
                width="100%"
                margin="0 1rem"
                disabled={dpoInfo.state.isCreated && dpoInfo.empty_seats.gt(new BN(0)) ? false : true || !isConnected}
              >
                {t(`Invite`)}
              </ButtonSecondary>
            </CopyHelper>
          </CenterWrapper>
        )}
      </EvenGrid>
    </>
  )
}

// function CreateDpoOrBuy({
//   dpoInfo,
//   onBuy,
//   onCreateDpo,
// }: {
//   dpoInfo: DpoInfo
//   onBuy: () => void
//   onCreateDpo: () => void
// }) {
//   // const userInDpo = useUserInDpo(dpoIndex, wallet?.address)
//   const isConnected = useIsConnected()
//   const { passengerSeatCap } = useConsts()
//   const theme = useTheme()
//   const { t } = useTranslation()
//   const dpoMembers = useQueryDpoMembers(dpoInfo.index.toString())
//   const [userMemberInfo, setUserMemberInfo] = useState<DpoMemberInfo>()
//   const wallet = useWallet()

//   useEffect(() => {
//     if (!wallet || !wallet.address || !dpoMembers || dpoMembers.length === 0) return
//     const memberInfo = dpoMembers.find(
//       (entry) => entry[1].buyer.isPassenger && entry[1].buyer.asPassenger.eq(wallet.address)
//     )
//     setUserMemberInfo(memberInfo ? memberInfo[1] : undefined)
//   }, [dpoMembers, wallet])

//   return (
//     <>
//       {isConnected ? (
//         <ContentWrapper>
//           <RowFixed justifyContent="center">
//             {passengerSeatCap && (
//               <ButtonPrimary
//                 mobileMinWidth="250px"
//                 margin="0 1rem"
//                 onClick={onBuy}
//                 disabled={
//                   (dpoInfo.state.isCreated &&
//                     userMemberInfo &&
//                     userMemberInfo.number_of_seats.toNumber() < passengerSeatCap) ||
//                   (dpoInfo.state.isCreated && !userMemberInfo)
//                     ? false
//                     : true
//                 }
//               >
//                 {t(`Buy`)}
//               </ButtonPrimary>
//             )}
//             {wallet && wallet.address && (
//               <CopyHelper
//                 toCopy={`${DAPP_HOST}/#/dpos/dpo/${dpoInfo.index.toString()}/activity?ref=${
//                   wallet.address
//                 }&project=${dpoInfo.token_id.asToken.toString()}`}
//                 childrenIsIcon={true}
//               >
//                 <ButtonSecondary
//                   mobileMinWidth="250px"
//                   margin="0 1rem"
//                   disabled={dpoInfo.state.isCreated && dpoInfo.empty_seats.gt(new BN(0)) ? false : true}
//                 >
//                   {t(`Invite`)}
//                 </ButtonSecondary>
//               </CopyHelper>
//             )}
//           </RowFixed>
//         </ContentWrapper>
//       ) : (
//         <>
//           {dpoInfo.state.isCreated && (
//             <ContentWrapper>
//               <BorderedWrapper borderColor={theme.primary1} style={{ padding: '0.5rem', width: 'auto', margin: '0' }}>
//                 <HeavyText width="100%" textAlign="center" fontSize={'12px'} color={theme.primary1}>
//                   {t(`Login to Join`)}
//                 </HeavyText>
//               </BorderedWrapper>
//             </ContentWrapper>
//           )}
//         </>
//       )}
//     </>
//   )
// }

function TargetDpoName({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())
  const theme = useTheme()
  return (
    <>
      <SLink to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/activity`} colorIsBlue>
        <Header4 width="fit-content" color={theme.blue2}>
          {target?.name.toString()}
        </Header4>
      </SLink>
    </>
  )
}

function TargetCabinName({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const theme = useTheme()
  const buyerInventoryIndex = useDpoTravelCabinInventoryIndex(
    dpoInfo.index.toString(),
    dpoInfo.target.asTravelCabin.toString()
  )

  if (!target) return null
  const hasPurchased = buyerInventoryIndex ? true : false
  const token = dpoInfo.token_id.asToken.toString().toLowerCase()
  return (
    <>
      {hasPurchased ? (
        <SLink
          to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}/inventory/${buyerInventoryIndex}`}
          colorIsBlue
        >
          <Header4 width="fit-content" color={theme.blue2}></Header4>
          {t(`TravelCabin`)}: {target.name.toString()}
        </SLink>
      ) : (
        <SHashLink to={`/projects/${token}?asset=TravelCabin#${target.name.toString()}`} colorIsBlue>
          <Header4 width="fit-content" color={theme.blue2}>
            {t(`TravelCabin`)}: {target.name.toString()}
          </Header4>
        </SHashLink>
      )}
    </>
  )
}

function MainSection({
  dpoInfo,
  selectedState,
  openBuyFormModal,
  openCreateDpoFormModal,
}: {
  dpoInfo: DpoInfo
  selectedState: string
  openBuyFormModal: () => void
  openCreateDpoFormModal: () => void
}) {
  const { t } = useTranslation()
  const stateCompleted = isDpoStateCompleted(dpoInfo, selectedState)
  const { chainDecimals } = useSubstrate()

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )

  return (
    <>
      <RowBetween>
        <div style={{ display: 'block' }}>
          {stateCompleted ? (
            <Header2 width="fit-content">{t(`Crowdfunded`)}</Header2>
          ) : (
            <Header2 width="fit-content">{t(`Crowdfunding`)}</Header2>
          )}
          <RowFixed>
            <Header4 width="fit-content" padding="0 0.25rem 0 0">{`${formatToUnit(
              dpoInfo.target_amount,
              chainDecimals
            )} ${token}`}</Header4>
            <Header4 width="fit-content" padding="0 0.25rem 0 0">
              {t(`For`).toLowerCase()}
            </Header4>
            {dpoInfo.target.isDpo ? <TargetDpoName dpoInfo={dpoInfo} /> : <TargetCabinName dpoInfo={dpoInfo} />}
          </RowFixed>
        </div>
      </RowBetween>
      <SpacedSection>
        <CenterWrapper>
          <SText fontSize="16px" mobileFontSize="14px">
            {t(`Join this DPO by Buying its Seats as a User or DPO`)}
          </SText>
        </CenterWrapper>
        <CreateHighlights dpoInfo={dpoInfo} onBuy={openBuyFormModal} onCreateDpo={openCreateDpoFormModal} />
        {/* <CreateDpoOrBuy dpoInfo={dpoInfo} onBuy={openBuyFormModal} onCreateDpo={openCreateDpoFormModal} /> */}
      </SpacedSection>
    </>
  )
}

export function CreatedDetails({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return <TargetedBy dpoInfo={dpoInfo} />
}

/**
 * CREATE STATUS
 * Main objective is to get the user to take action, Create DPO or buy
 * - Show user valuable information
 * - curState is the state the user filters not dpoInfo.state
 */
export default function CreatedCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  const { t } = useTranslation()
  const [buyFormModalOpen, setBuyFormModalOpen] = useState<boolean>(false)
  const [createDpoFormModalOpen, setCreateDpoFormModalOpen] = useState<boolean>(false)
  const [buyTxModalOpen, setBuyTxModalOpen] = useState<boolean>(false)
  const [createDpoTxModalOpen, setCreateDpoTxModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const [createDpoData, setCreateDpoData] = useState<CreateDpoData>({})
  const [buyData, setBuyData] = useState<BuyData>({})
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const [txInfo, setTxInfo] = useState<TxInfo>({})
  const { chainDecimals } = useSubstrate()
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)

  const { createTx, submitTx } = useTxHelpers()

  const openBuyTxModal = () => {
    ;[setCreateDpoFormModalOpen, setBuyFormModalOpen, setCreateDpoTxModalOpen].forEach((fn) => fn(false))
    setBuyTxModalOpen(true)
  }

  const openCreateDpoTxModal = () => {
    ;[setBuyTxModalOpen, setCreateDpoFormModalOpen, setBuyFormModalOpen].forEach((fn) => fn(false))
    setCreateDpoTxModalOpen(true)
  }

  const openBuyFormModal = () => {
    ;[setCreateDpoTxModalOpen, setBuyTxModalOpen, setCreateDpoFormModalOpen].forEach((fn) => fn(false))
    setBuyFormModalOpen(true)
  }

  const openCreateDpoFormModal = () => {
    ;[setCreateDpoTxModalOpen, setBuyFormModalOpen, setBuyTxModalOpen].forEach((fn) => fn(false))
    setCreateDpoFormModalOpen(true)
  }

  const dismissModal = () => {
    ;[setBuyFormModalOpen, setCreateDpoFormModalOpen, setBuyTxModalOpen, setCreateDpoTxModalOpen].forEach((fn) =>
      fn(false)
    )
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const handleBuy = ({
    referrer,
    seats,
    newReferrer,
  }: {
    referrer: string | null
    seats: string
    newReferrer: boolean
  }) => {
    if (!dpoInfo.index.toString()) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    setBuyData({ dpoIndex: dpoInfo.index.toString(), targetSeats: seats, referrer, newReferrer })
    const txData = createTx({
      section: 'bulletTrain',
      method: 'passengerBuyDpoSeats',
      params: { targetDpoIdx: dpoInfo.index.toString(), numberOfSeats: seats, referrerAccount: referrer },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    openBuyTxModal()
  }

  const handleCreateDpo = ({
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
    setCreateDpoData({
      dpoName,
      targetSeats: seats.toString(),
      managerSeats: managerSeats.toString(),
      baseFee: baseFee.toString(),
      directReferralRate: directReferralRate.toString(),
      end: endBlock.toString(),
      referrer,
      newReferrer,
    })
    if (!dpoInfo.index.toString()) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    // baseFee and directReferralRate is per 0.1%
    const txData = createTx({
      section: 'bulletTrain',
      method: 'createDpo',
      params: {
        name: dpoName,
        target: { Dpo: [dpoInfo.index.toString(), seats] },
        managerSeats,
        baseFee: baseFee * 10,
        directReferralRate: directReferralRate * 10,
        end: endBlock.toString(),
        referrer,
      },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    openCreateDpoTxModal()
  }

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )

  return (
    <>
      {selectedState === 'CREATED' && (
        <StateOverlay isOn={!dpoStateIsSelectedState}>
          <StandardModal
            title={t(`Buy DPO Seats`)}
            isOpen={buyFormModalOpen}
            onDismiss={dismissModal}
            desktopScroll={true}
          >
            <FormBuyDpoSeats dpoInfo={dpoInfo} token={token} chainDecimals={chainDecimals} onSubmit={handleBuy} />
          </StandardModal>
          <FormCreateDpo
            targetType={'DPO'}
            dpoInfo={dpoInfo}
            isOpen={createDpoFormModalOpen}
            onDismiss={dismissModal}
            onSubmit={handleCreateDpo}
          />
          <TxModal
            isOpen={buyTxModalOpen}
            onDismiss={dismissModal}
            onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
            title={t(`Buy DPO Seats`)}
            buttonText={t(`Confirm`)}
            txError={txErrorMsg}
            txHash={txHash}
            txPending={txPendingMsg}
          >
            <DpoBuyTxConfirm
              targetSeats={buyData.targetSeats}
              referrer={buyData.referrer}
              newReferrer={buyData.newReferrer}
              deposit={formatToUnit(
                dpoInfo.amount_per_seat.toBn().mul(new BN(buyData.targetSeats ? buyData.targetSeats : 0)),
                chainDecimals,
                2
              )}
              token={token}
              estimatedFee={txInfo.estimatedFee}
            />
          </TxModal>
          <TxModal
            isOpen={createDpoTxModalOpen}
            onDismiss={dismissModal}
            onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
            title={t(`Create DPO`)}
            buttonText={t(`Confirm`)}
            txError={txErrorMsg}
            txHash={txHash}
            txPending={txPendingMsg}
          >
            <DpoCreateDpoTxConfirm
              target={dpoInfo.name.toString()}
              dpoName={createDpoData.dpoName}
              managerSeats={createDpoData.managerSeats}
              targetSeats={createDpoData.targetSeats}
              end={createDpoData.end}
              baseFee={createDpoData.baseFee}
              directReferralRate={createDpoData.directReferralRate}
              referrer={createDpoData.referrer}
              newReferrer={createDpoData.newReferrer}
              targetAmount={formatToUnit(
                dpoInfo.amount_per_seat.toBn().mul(new BN(createDpoData.targetSeats ? createDpoData.targetSeats : 0)),
                chainDecimals,
                2
              )}
              token={token}
              estimatedFee={txInfo.estimatedFee}
              dpoInfo={dpoInfo}
            />
          </TxModal>
          <MainSection
            key={0}
            dpoInfo={dpoInfo}
            selectedState={selectedState}
            openBuyFormModal={openBuyFormModal}
            openCreateDpoFormModal={openCreateDpoFormModal}
          />
          <DpoActions dpoInfo={dpoInfo} selectedState={selectedState} />
        </StateOverlay>
      )}
    </>
  )
}
