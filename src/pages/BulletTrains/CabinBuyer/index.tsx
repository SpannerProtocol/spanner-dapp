import { PageWrapper, Section, Wrapper } from '../../../components/Wrapper'
import { HeavyText, SText } from '../../../components/Text'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Row, { RowBetween } from '../../../components/Row'
import { getCabinClassByIndex, getCabinClassImage } from '../../../utils/getCabinClass'
import { ReactComponent as Ticket } from '../../../assets/svg/ticket.svg'
import { FlatCard } from '../../../components/Card'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from '../../../components/Button'
import { useItemCabinBuyer } from '../../../hooks/useItem'
import {
  useSubTravelCabin,
  useSubTravelCabinBuyerVerbose,
  useTravelCabinBuyers,
} from '../../../hooks/useQueryTravelCabins'
import {
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex,
} from 'interfaces/bulletTrain'
import { bnToUnit, formatToUnit } from '../../../utils/formatUnit'
import { useSubstrate } from '../../../hooks/useSubstrate'
import { shortenAddr } from '../../../utils/truncateString'
import { estimateBlockToTs, tsToDate, tsToTime } from '../../../utils/formatBlocks'
import BN from 'bn.js'
import useUserActions from '../../../hooks/useUserActions'
import TxModal from '../../../components/Modal/TxModal'
import TxFee from '../../../components/TxFee'
import useTxHelpers from '../../../hooks/useTxHelpers'
import { Step, StepLabel, Stepper } from '@material-ui/core'
import type { BlockNumber } from '@polkadot/types/interfaces'
import { Moment } from '@polkadot/types/interfaces'
import { useBlockManager, useBlockTime } from '../../../hooks/useBlocks'

export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`
export default function TravelCabinBuyer() {
  const { travelCabinIndex, travelCabinInventoryIndex } = useItemCabinBuyer()
  const travelCabinInfo = useSubTravelCabin(travelCabinIndex)
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  const [selectedBuyer, setSelectedBuyer] = useState<
    [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  >()
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const { lastBlock, expectedBlockTime } = useBlockManager()

  useEffect(() => {
    if (buyers.length === 0) return
    setSelectedBuyer(
      buyers.find((buyer) => buyer[0][0].eq(travelCabinIndex) && buyer[0][1].eq(travelCabinInventoryIndex))
    )
  }, [buyers, travelCabinIndex, travelCabinInventoryIndex])

  if (!travelCabinInfo) return <></>
  const token = travelCabinInfo.token_id.isToken
    ? travelCabinInfo.token_id.asToken.toString()
    : travelCabinInfo.token_id.asDexShare.toString()
  return (
    <>
      <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
        <Wrapper
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ margin: '1rem 0rem', textAlign: 'center' }}>
            <Section>
              <HeavyText fontSize={'18px'} mobileFontSize={'18px'} style={{ margin: 'auto' }}>
                {t('Spanner TravelCabin Inventory')}
              </HeavyText>
            </Section>
          </div>
          {selectedBuyer && (
            <HomeContentWrapper>
              <CabinInfo
                travelCabinInfo={travelCabinInfo}
                travelCabinInventoryIndex={travelCabinInventoryIndex}
                chainDecimals={chainDecimals}
                token={token}
                selectedBuyer={selectedBuyer}
              />
              <YieldAvailable
                travelCabinInfo={travelCabinInfo}
                travelCabinInventoryIndex={travelCabinInventoryIndex}
                chainDecimals={chainDecimals}
                token={token}
                selectedBuyer={selectedBuyer}
                lastBlock={lastBlock}
              />
              <FareAvailable
                travelCabinInfo={travelCabinInfo}
                travelCabinInventoryIndex={travelCabinInventoryIndex}
                chainDecimals={chainDecimals}
                token={token}
                selectedBuyer={selectedBuyer}
              />
              <Trip
                travelCabinInfo={travelCabinInfo}
                travelCabinInventoryIndex={travelCabinInventoryIndex}
                chainDecimals={chainDecimals}
                token={token}
                selectedBuyer={selectedBuyer}
                lastBlock={lastBlock}
                expectedBlockTime={expectedBlockTime}
              />
              {/*<Activity />*/}
            </HomeContentWrapper>
          )}
        </Wrapper>
      </PageWrapper>
    </>
  )
}

interface CabinInfoProps {
  travelCabinInfo: TravelCabinInfo
  travelCabinInventoryIndex: string
  chainDecimals: number
  token: string
  selectedBuyer: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  lastBlock?: BlockNumber
  expectedBlockTime?: Moment
  genesisTs?: number
}

export function CabinInfo(props: CabinInfoProps) {
  const { t } = useTranslation()
  const { travelCabinInfo, travelCabinInventoryIndex, chainDecimals, token, selectedBuyer } = props
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
        {travelCabinInfo && (
          <RowBetween>
            <div
              style={{
                maxWidth: '45px',
                width: '45px',
              }}
            >
              {getCabinClassImage(travelCabinInfo.name.toString())}
            </div>
            <div>
              <HeavyText fontSize={'16px'} mobileFontSize={'16px'} style={{ float: 'right' }} width={'fit-content'}>
                {`${t(`TravelCabin`)} ${t(travelCabinInfo.name.toString())} #${travelCabinInventoryIndex.toString()}`}
              </HeavyText>
              <Row style={{ justifyContent: 'flex-end' }} padding={'0.5rem 0rem'}>
                <Ticket />
                <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'} width={'fit-content'}>
                  {`${formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals)} ${token}`}
                </SText>
              </Row>
            </div>
          </RowBetween>
        )}
        {selectedBuyer && (
          <SText fontSize={'16px'} mobileFontSize={'16px'} padding={'1rem 0rem'}>
            {selectedBuyer[1].buyer.isPassenger &&
              `${t(`Buyer`)}: ${shortenAddr(selectedBuyer[1].buyer.asPassenger.toString(), 7)} (${t(`Passenger`)})`}
            {selectedBuyer[1].buyer.isDpo && `${t(`Buyer`)}: DPO #${selectedBuyer[1].buyer.asDpo.toString()}`}
          </SText>
        )}
      </FlatCard>
    </>
  )
}

export function YieldAvailable(props: CabinInfoProps) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const { travelCabinInfo, travelCabinInventoryIndex, chainDecimals, token, selectedBuyer, lastBlock } = props
  const [yieldAvailable, setYieldAvailable] = useState<string>()
  const buyer = useSubTravelCabinBuyerVerbose(selectedBuyer[0][0], selectedBuyer[0][1])

  useEffect(() => {
    if (lastBlock && travelCabinInfo && buyer) {
      // Precision for bn division
      const bn10000 = new BN(10000)
      let percentage = new BN(10000)
      if (!travelCabinInfo.maturity.isZero()) {
        const blockSincePurchase = lastBlock.sub(buyer[1].purchase_blk)
        percentage = blockSincePurchase.mul(bn10000).div(travelCabinInfo.maturity.toBn())
        percentage = percentage.gte(bn10000) ? bn10000 : percentage
        const accumulatedYield = percentage.mul(travelCabinInfo.yield_total.toBn())
        const amount = accumulatedYield.sub(buyer[1].yield_withdrawn.toBn().mul(bn10000))
        if (amount.gt(new BN(0))) {
          // shift decimal places by 4 because of precision used with
          const amountInPrecision = bnToUnit(amount, chainDecimals, -4, true)
          setYieldAvailable(amountInPrecision)
        } else {
          setYieldAvailable('0')
        }
      }
    }
  }, [buyer, chainDecimals, lastBlock, travelCabinInfo])

  const [actionEnable, setActionEnable] = useState<boolean>(false)
  const { actions } = useUserActions(travelCabinInfo.index, travelCabinInventoryIndex)
  useEffect(() => {
    setActionEnable(false)
    if (!actions) return
    actions.forEach((action) => {
      if (action.action === 'withdrawYieldFromTravelCabin') {
        setActionEnable(true)
      }
    })
  }, [actions, buyer, yieldAvailable])

  const [estimatedFee, setEstimatedFee] = useState<string>()

  const [commitDpoModalOpen, setCommitDpoModalOpen] = useState<boolean>(false)
  const [txPendingMsg, setTxPendingMsg] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [txErrorMsg, setTxErrorMsg] = useState<string>()

  const { createTx, submitTx } = useTxHelpers()

  const dismissModal = () => {
    ;[setCommitDpoModalOpen].forEach((fn) => fn(false))
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }
  const transaction = {
    section: 'bulletTrain',
    method: 'withdrawYieldFromTravelCabin',
    params: { travelCabinIdx: travelCabinInfo.index, travelCabinNumber: travelCabinInventoryIndex },
  }

  const handleConfirm = useCallback(() => {
    const txData = createTx({
      section: transaction.section,
      method: transaction.method,
      params: transaction.params,
    })
    if (txData && setEstimatedFee) {
      txData.estimatedFee.then((fee) => setEstimatedFee(fee))
    }
    setCommitDpoModalOpen(!commitDpoModalOpen)
  }, [commitDpoModalOpen, createTx, setEstimatedFee, transaction.method, transaction.params, transaction.section])

  if (!buyer) return <></>

  return (
    <>
      <TxModal
        isOpen={commitDpoModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t('Withdraw Yield')}
        buttonText={t('Withdraw')}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <>
          <SText>
            {t(`Confirm Withdraw Yield from TravelCabin`)}: {getCabinClassByIndex(travelCabinInfo.index.toString())}
          </SText>
          <TxFee fee={estimatedFee} />
        </>
      </TxModal>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
          {t('Yield Available')}
        </HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText width={'fit-content'} fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>
            {`${yieldAvailable} ${token}`}
          </HeavyText>
          <ButtonPrimary
            padding="1rem"
            fontSize="14px"
            mobileFontSize="14px"
            onClick={handleConfirm}
            disabled={!actionEnable}
          >
            {t(`Withdraw`)}
          </ButtonPrimary>
        </RowBetween>
        <SText fontSize={'12px'} mobileFontSize={'12px'}>
          {`${t('Withdrawn')}:${formatToUnit(buyer[1].yield_withdrawn.toString(), chainDecimals, 2)}/${formatToUnit(
            travelCabinInfo.yield_total.toString(),
            chainDecimals,
            2
          )} ${token}`}
        </SText>
      </FlatCard>
    </>
  )
}

export function FareAvailable(props: CabinInfoProps) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const { travelCabinInfo, travelCabinInventoryIndex, chainDecimals, token, selectedBuyer } = props
  const buyer = useSubTravelCabinBuyerVerbose(selectedBuyer[0][0], selectedBuyer[0][1])

  const [actionEnable, setActionEnable] = useState<boolean>(false)
  const { actions } = useUserActions(travelCabinInfo.index, travelCabinInventoryIndex)
  useEffect(() => {
    setActionEnable(false)
    if (!actions) return
    actions.forEach((action) => {
      if (action.action === 'withdrawFareFromTravelCabin') {
        setActionEnable(true)
      }
    })
  }, [actions, buyer])

  const [estimatedFee, setEstimatedFee] = useState<string>()

  const [commitDpoModalOpen, setCommitDpoModalOpen] = useState<boolean>(false)
  const [txPendingMsg, setTxPendingMsg] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [txErrorMsg, setTxErrorMsg] = useState<string>()

  const { createTx, submitTx } = useTxHelpers()

  const dismissModal = () => {
    ;[setCommitDpoModalOpen].forEach((fn) => fn(false))
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }
  const transaction = {
    section: 'bulletTrain',
    method: 'withdrawFareFromTravelCabin',
    params: { travelCabinIdx: travelCabinInfo.index, travelCabinNumber: travelCabinInventoryIndex },
  }

  const handleConfirm = useCallback(() => {
    const txData = createTx({
      section: transaction.section,
      method: transaction.method,
      params: transaction.params,
    })
    if (txData && setEstimatedFee) {
      txData.estimatedFee.then((fee) => setEstimatedFee(fee))
    }
    setCommitDpoModalOpen(!commitDpoModalOpen)
  }, [commitDpoModalOpen, createTx, setEstimatedFee, transaction.method, transaction.params, transaction.section])

  const fareAmount = formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)
  if (!buyer) return <></>

  return (
    <>
      <TxModal
        isOpen={commitDpoModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t('Withdraw Fare')}
        buttonText={t('Withdraw')}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <>
          <SText>
            {t(`Confirm Withdraw Ticket Fare from TravelCabin`)}:{' '}
            {getCabinClassByIndex(travelCabinInfo.index.toString())}
          </SText>
          <TxFee fee={estimatedFee} />
        </>
      </TxModal>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
          {t('Fare Available')}
        </HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText width={'fit-content'} fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>
            {`${actionEnable ? fareAmount : 0} ${token}`}
          </HeavyText>
          <ButtonPrimary
            padding="1rem"
            fontSize="14px"
            mobileFontSize="14px"
            onClick={handleConfirm}
            disabled={!actionEnable}
          >
            {t(`Withdraw`)}
          </ButtonPrimary>
        </RowBetween>
        <SText fontSize={'12px'} mobileFontSize={'12px'}>
          {`${t('Withdrawn')}:${buyer[1].fare_withdrawn.isTrue ? fareAmount : 0}/${fareAmount} ${token}`}
        </SText>
      </FlatCard>
    </>
  )
}

const TripDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export function Trip(props: CabinInfoProps) {
  const { travelCabinInfo, selectedBuyer, lastBlock, expectedBlockTime } = props

  const [activeStep, setActiveStep] = useState<number>(1)
  const { t } = useTranslation()

  const startTime = useBlockTime(selectedBuyer[1].purchase_blk)

  useEffect(() => {
    if (!lastBlock) return
    const remainBlock = travelCabinInfo.maturity.add(selectedBuyer[1].purchase_blk).toNumber() - lastBlock.toNumber()
    if (remainBlock <= 0) {
      setActiveStep(2)
    }
  }, [travelCabinInfo, selectedBuyer, lastBlock])

  if (!travelCabinInfo || !selectedBuyer || !lastBlock) return <></>

  return (
    <>
      <HeavyText fontSize={'18px'} mobileFontSize={'18px'} padding={'2rem 0rem'}>
        {t('Trip')}
      </HeavyText>

      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <Row justifyContent={'flex-end'}>
          <SText fontSize={'14px'} mobileFontSize={'14px'}>
            {/*{`block:204324`}*/}
          </SText>
        </Row>
        {/*<SText fontSize={'14px'} mobileFontSize={'14px'} style={{ margin: 'auto' }}>*/}
        {/*  {genesisTs && expectedBlockTime && selectedBuyer && travelCabinInfo && remainBlock > 0*/}
        {/*    ? `${tsToRelative(*/}
        {/*        blockToTs(*/}
        {/*          genesisTs,*/}
        {/*          expectedBlockTime.toNumber(),*/}
        {/*          travelCabinInfo.maturity.add(selectedBuyer[1].purchase_blk).toNumber()*/}
        {/*        ) / 1000*/}
        {/*      )}`*/}
        {/*    : ` `}*/}
        {/*</SText>*/}
        <div>
          {startTime && expectedBlockTime && selectedBuyer && travelCabinInfo && (
            <div>
              <Stepper alternativeLabel activeStep={activeStep}>
                <Step>
                  <StepLabel>
                    <TripDiv>
                      <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {t(`Start`)}
                      </HeavyText>
                      <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {tsToDate(startTime / 1000)}
                      </SText>
                      <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {tsToTime(startTime / 1000)}
                      </SText>
                    </TripDiv>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    <TripDiv>
                      <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {t(`End`)}
                      </HeavyText>
                      <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {tsToDate(
                          estimateBlockToTs(
                            startTime,
                            expectedBlockTime.toNumber(),
                            travelCabinInfo.maturity.toNumber()
                          ) / 1000
                        )}
                      </SText>
                      <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                        {tsToTime(
                          estimateBlockToTs(
                            startTime,
                            expectedBlockTime.toNumber(),
                            travelCabinInfo.maturity.toNumber()
                          ) / 1000
                        )}
                      </SText>
                    </TripDiv>
                  </StepLabel>
                </Step>
              </Stepper>
            </div>
          )}
        </div>
      </FlatCard>
    </>
  )
}

export function Activity() {
  return (
    <>
      <HeavyText fontSize={'18px'} mobileFontSize={'18px'} padding={'2rem 0rem'}>
        {'Activity'}
      </HeavyText>
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
    </>
  )
}

export function ActivityItem() {
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <RowBetween>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {t(`Withdraw`)}
          </HeavyText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {`0.675 BOLT`}
          </SText>
        </RowBetween>
        <RowBetween padding={'0.6rem 0rem'}>
          <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {`5gfdsafe......rewqrewf`}`
          </SText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0.6rem 0rem'} width={'fit-content'}>
            {`13 mins ago`}
          </SText>
        </RowBetween>
      </FlatCard>
    </>
  )
}
