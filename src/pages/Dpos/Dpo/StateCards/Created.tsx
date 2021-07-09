import BN from 'bn.js'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { CopyWrapper } from 'components/Copy/Copy'
import Divider from 'components/Divider'
import BuyAssetForm from 'components/Form/FormBuyAsset'
import { EvenGrid } from 'components/Grid'
import { SHashLink, SLink } from 'components/Link'
import { StateOverlay } from 'components/Overlay'
import { CircleProgress } from 'components/ProgressBar'
import { RowBetween, RowBlock, RowFixed } from 'components/Row'
import { Header2, Header4, HeavyText, SText, TokenText } from 'components/Text'
import { CenterWrapper, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import useConsts from 'hooks/useConsts'
import useDpoFees from 'hooks/useDpoFees'
import { useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { DpoInfo, DpoMemberInfo } from 'spanner-interfaces/types'
import isDpoStateCompleted, { isDpoStateSelectedState } from 'utils/dpoStateCompleted'
import { blocksToCountDown, formatBlocksCountdown } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import getApy from 'utils/getApy'
import useTheme from 'utils/useTheme'
import DpoActions from '.'
import { DAPP_HOST } from '../../../../constants'
import TargetedBy from '../TargetedBy'

function CreateHighlights({ dpoInfo, onBuy }: { dpoInfo: DpoInfo; onBuy: () => void }) {
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
            <CopyWrapper
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
            </CopyWrapper>
          </CenterWrapper>
        )}
      </EvenGrid>
    </>
  )
}

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
}: {
  dpoInfo: DpoInfo
  selectedState: string
  openBuyFormModal: () => void
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
        <CreateHighlights dpoInfo={dpoInfo} onBuy={openBuyFormModal} />
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
  const [buyFormModalOpen, setBuyFormModalOpen] = useState<boolean>(false)
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)

  return (
    <>
      {selectedState === 'CREATED' && (
        <StateOverlay isOn={!dpoStateIsSelectedState}>
          <BuyAssetForm
            targetType={'DPO'}
            buyType={'Buy'}
            dpoInfo={dpoInfo}
            isOpen={buyFormModalOpen}
            setIsOpen={setBuyFormModalOpen}
          />
          <MainSection
            key={0}
            dpoInfo={dpoInfo}
            selectedState={selectedState}
            openBuyFormModal={() => setBuyFormModalOpen(true)}
          />
          <DpoActions dpoInfo={dpoInfo} selectedState={selectedState} />
        </StateOverlay>
      )}
    </>
  )
}
