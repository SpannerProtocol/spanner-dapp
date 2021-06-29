import { useProjectManager } from '../../state/project/hooks'
import { useSubstrate } from '../../hooks/useSubstrate'
import { useSubTravelCabinInventory, useTravelCabins } from '../../hooks/useQueryTravelCabins'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { getCabinClassImage, getCabinOrder } from '../../utils/getCabinClass'
import { Header2, HeavyText, SText } from '../../components/Text'
import { GridWrapper } from '../../components/Wrapper'
import { TravelCabinInfo } from 'interfaces/bulletTrain'
import { useBlockManager } from '../../hooks/useBlocks'
import { useTranslation } from 'react-i18next'
import cdDivide from '../../utils/cdDivide'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import { ReactComponent as Ticket } from '../../assets/svg/ticket.svg'
import { formatToUnit } from '../../utils/formatUnit'
import getApy from '../../utils/getApy'
import { blockToDays, daysToBlocks } from '../../utils/formatBlocks'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import useTxHelpers, { TxInfo } from '../../hooks/useTxHelpers'
import { useIsConnected } from '../../hooks/useWallet'
import TxModal from '../../components/Modal/TxModal'
import { TravelCabinJoinTxConfirm } from './modal/TravelCabinJoinTxConfirm'
import { TravelCabinCrowdfundTxConfirm } from './modal/TravelCabinCrowdfundTxConfirm'
import DpoModalForm from '../Dpos/Dpo/FormCreateDpo'
import { DetailCardSimple } from '../../components/Card/DetailCard'
import styled, { ThemeContext } from 'styled-components'

export function Cabins() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabins = useTravelCabins(projectState.selectedProject?.token)

  const sortedCabins = useMemo(
    () => travelCabins.sort((t1, t2) => getCabinOrder(t1[1].name.toString()) - getCabinOrder(t2[1].name.toString())),
    [travelCabins]
  )
  return (
    <GridWrapper columns="1">
      {sortedCabins.map((entry, index) => {
        const travelCabinInfo = entry[1]
        const token = travelCabinInfo.token_id.isToken
          ? travelCabinInfo.token_id.asToken.toString()
          : travelCabinInfo.token_id.asDexShare.toString()
        return <CabinCard key={index} item={entry[1]} token={token} chainDecimals={chainDecimals} />
      })}
    </GridWrapper>
  )
}

export function CabinsSection() {
  const { t } = useTranslation()
  return (
    <>
      <Header2 padding="1rem 0">{t('Buy a Cabin')}</Header2>
      <Cabins />
    </>
  )
}

export const CabinCardGrid = styled.div`
  display: grid;
  grid-template-areas: 'state info apy bonus';
  background: transparent;
  grid-template-columns: minmax(40px, 50px) 3fr 1fr 1fr;
  grid-column-gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  justify-content: flex-start;
  text-align: left;
  margin: 0;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas: 'state info apy bonus';
    background: transparent;
    grid-template-columns: minmax(40px, 50px) 3fr 1fr 1fr;
    grid-column-gap: 0.25rem;
    text-align: left;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    width: 100%;
  `};
`

interface TravelCabinCard {
  item: TravelCabinInfo
  chainDecimals: number
  token: string
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

function CabinCardDetails(props: TravelCabinCard) {
  const { item, chainDecimals, token } = props
  const travelCabinInfo = item
  const { t } = useTranslation()
  const { expectedBlockTime, lastBlock } = useBlockManager()

  const inventoryCount = useSubTravelCabinInventory(travelCabinInfo.index)

  const [crowdfundFormModalOpen, setCrowdfundFormModalOpen] = useState<boolean>(false)
  const [joinTxModalOpen, setJoinTxModalOpen] = useState<boolean>(false)
  const [crowdfundTxModalOpen, setCrowdfundTxModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData>({})
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const isConnected = useIsConnected()
  const travelCabinIndex = travelCabinInfo.index

  const openJoinTxModal = () => {
    setCrowdfundFormModalOpen(false)
    setJoinTxModalOpen(true)
  }

  const openCrowdfundTxModal = () => {
    setCrowdfundFormModalOpen(false)
    setCrowdfundTxModalOpen(true)
  }

  const openCrowdfundFormModal = () => {
    setCrowdfundTxModalOpen(false)
    setCrowdfundFormModalOpen(true)
  }

  const dismissModal = () => {
    ;[setCrowdfundFormModalOpen, setJoinTxModalOpen, setCrowdfundTxModalOpen].forEach((fn) => fn(false))
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const handleCrowdfundFormCallback = ({
    dpoName,
    managerSeats,
    baseFee,
    directReferralRate,
    end,
    referrer,
    newReferrer,
  }: {
    dpoName: string
    managerSeats: number
    baseFee: number
    directReferralRate: number
    end: number
    referrer: string
    newReferrer: boolean
  }) => {
    if (!lastBlock || !expectedBlockTime) {
      return
    }
    const daysBlocks = daysToBlocks(end, expectedBlockTime)
    const endBlock = lastBlock.add(daysBlocks)
    setCrowdfundData({
      dpoName,
      managerSeats: managerSeats.toString(),
      baseFee: baseFee.toString(),
      directReferralRate: directReferralRate.toString(),
      end: endBlock.toString(),
      referrer,
      newReferrer,
    })
    if (!travelCabinIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    const txData = createTx({
      section: 'bulletTrain',
      method: 'createDpo',
      params: {
        name: dpoName,
        target: { TravelCabin: travelCabinIndex },
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

  const handleJoin = useCallback(() => {
    if (!travelCabinIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    const txData = createTx({
      section: 'bulletTrain',
      method: 'passengerBuyTravelCabin',
      params: { travelCabinIdx: travelCabinIndex },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    openJoinTxModal()
  }, [createTx, t, travelCabinIndex])

  return (
    <>
      <DpoModalForm
        targetType={'TravelCabin'}
        isOpen={crowdfundFormModalOpen}
        onDismiss={dismissModal}
        travelCabinInfo={travelCabinInfo}
        onSubmit={handleCrowdfundFormCallback}
      />
      <TxModal
        isOpen={joinTxModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Buy TravelCabin`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <TravelCabinJoinTxConfirm
          deposit={formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)}
          token={token}
          estimatedFee={txInfo?.estimatedFee}
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
        <TravelCabinCrowdfundTxConfirm
          target={travelCabinInfo.name.toString()}
          targetAmount={travelCabinInfo.deposit_amount.toString()}
          dpoName={crowdfundData.dpoName}
          managerSeats={crowdfundData.managerSeats}
          baseFee={crowdfundData.baseFee}
          directReferralRate={crowdfundData.directReferralRate}
          end={crowdfundData.end}
          referrer={crowdfundData.referrer}
          newReferrer={crowdfundData.newReferrer}
          token={token}
          estimatedFee={txInfo?.estimatedFee}
        />
      </TxModal>
      {expectedBlockTime && (
        <RowBetween padding={'0.5rem 4rem'}>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {t(`Trip`)}
          </HeavyText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {' '}
            {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}
          </SText>
        </RowBetween>
      )}
      {inventoryCount && (
        <RowBetween padding={'0.5rem 4rem'}>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
            {t(`Available`)}
          </HeavyText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {`${inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}/${inventoryCount[1].toNumber()}`}
          </SText>
        </RowBetween>
      )}
      <Row style={{ alignItems: 'stretch', justifyContent: 'space-around' }} marginTop={'1.5rem'}>
        <ButtonPrimary
          padding="1rem"
          fontSize="14px"
          disabled={!isConnected}
          mobileFontSize="14px"
          onClick={openCrowdfundFormModal}
        >
          {t(`Buy with DPO`)}
        </ButtonPrimary>
        <ButtonSecondary
          padding="1rem"
          fontSize="14px"
          disabled={!isConnected}
          mobileFontSize="14px"
          onClick={handleJoin}
        >
          {t(`Buy`)}
        </ButtonSecondary>
      </Row>
    </>
  )
}

export function CabinCard(props: TravelCabinCard) {
  const { item, chainDecimals, token } = props
  const travelCabinInfo = item
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  const theme = useContext(ThemeContext)

  const bonusPercent = Math.floor(
    cdDivide(travelCabinInfo.bonus_total, travelCabinInfo.deposit_amount, chainDecimals) * 100
  )

  if (!travelCabinInfo) return <></>

  return (
    <>
      <DetailCardSimple
        smallDetails
        defaultShow={true}
        details={<CabinCardDetails item={item} token={token} chainDecimals={chainDecimals} />}
      >
        <CabinCardGrid id={travelCabinInfo.name.toString()}>
          <div style={{ maxWidth: '30px', width: '30px' }}>{getCabinClassImage(travelCabinInfo.name.toString())}</div>
          <div>
            <HeavyText fontSize={'18px'} mobileFontSize={'14px'}>
              {`${t(`TravelCabin`)} ${travelCabinInfo.name.toString()}`}
            </HeavyText>
            <Row style={{ justifyContent: 'flex-start', textAlign: 'left' }} padding={'0.5rem 0rem'}>
              <Ticket width="20px" height="20px" />
              <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'} width={'fit-content'}>
                {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)} {token}
              </SText>
            </Row>
          </div>
          {expectedBlockTime && (
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                {t(`APY`)}
              </HeavyText>
              <HeavyText width="100%" fontSize="18px" mobileFontSize="14px" colorIsPrimary textAlign="left" padding="0">
                {expectedBlockTime && (
                  <>
                    {`${getApy({
                      totalYield: travelCabinInfo.yield_total.toBn(),
                      totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blockTime: expectedBlockTime,
                      period: travelCabinInfo.maturity,
                    })}%`}
                  </>
                )}
              </HeavyText>
            </div>
          )}
          <RowFixed>
            <div style={{ display: 'block', width: '100%' }}>
              <HeavyText width="100%" textAlign="left" color={theme.text3} padding="0">
                {t(`Bonus`)}
              </HeavyText>
              <HeavyText width="100%" fontSize="18px" mobileFontSize="14px" colorIsPrimary textAlign="left" padding="0">
                {bonusPercent}%
              </HeavyText>
            </div>
          </RowFixed>
        </CabinCardGrid>
      </DetailCardSimple>
    </>
  )
}
