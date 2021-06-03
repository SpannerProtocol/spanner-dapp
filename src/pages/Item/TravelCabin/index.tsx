import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { GridCell, GridRow } from 'components/Grid'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, ItalicText, Header2, SmallText, SText } from 'components/Text'
import TxFee from 'components/TxFee'
import {
  BorderedWrapper,
  ButtonWrapper,
  CollapseWrapper,
  ContentWrapper,
  Section,
  SpacedSection,
} from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubTravelCabin, useSubTravelCabinInventory, useTravelCabinBuyers } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { useIsConnected } from 'hooks/useWallet'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'styled-components'
import { blockToDays, blockToTs, daysToBlocks, tsToRelative } from '../../../utils/formatBlocks'
import { formatToUnit } from '../../../utils/formatUnit'
import getApy from '../../../utils/getApy'
import { getCabinClassImage } from '../../../utils/getCabinClass'
import { shortenAddr } from '../../../utils/truncateString'
import DpoModalForm from '../Dpo/Form'

interface TravelCabinItemProps {
  travelCabinIndex: string
}

interface TravelCabinJoinTxConfirmProps {
  deposit: string
  token: string
  estimatedFee?: string
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

function TravelCabinCrowdfundTxConfirm({
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
            <SText>{`${endInDays} ${t(`days`)}`}</SText>
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

function TravelCabinJoinTxConfirm({ deposit, token, estimatedFee }: TravelCabinJoinTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <SText>{t(`Buy this TravelCabin to start earning Rewards`)}</SText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <SText>{t(`Ticket Fare (deposit)`)}</SText>
          <SText>
            {deposit} {token}
          </SText>
        </RowBetween>
      </BorderedWrapper>
      <Balance token={token} />
      <TxFee fee={estimatedFee} />
    </>
  )
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

function SelectedTravelCabin(props: TravelCabinItemProps): JSX.Element {
  const { travelCabinIndex } = props
  const travelCabinInfo = useSubTravelCabin(travelCabinIndex)
  const inventoryCount = useSubTravelCabinInventory(travelCabinIndex)
  const { chainDecimals } = useSubstrate()
  const [crowdfundFormModalOpen, setCrowdfundFormModalOpen] = useState<boolean>(false)
  const [joinTxModalOpen, setJoinTxModalOpen] = useState<boolean>(false)
  const [crowdfundTxModalOpen, setCrowdfundTxModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData>({})
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { t } = useTranslation()
  const isConnected = useIsConnected()
  const theme = useContext(ThemeContext)

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

  if (!travelCabinInfo) return <></>
  const token = travelCabinInfo.token_id.isToken
    ? travelCabinInfo.token_id.asToken.toString()
    : travelCabinInfo.token_id.asDexShare.toString()

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
      <ContentWrapper>
        <Card style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Section>
            <RowBetween>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', maxWidth: '25px', maxHeight: '25px', paddingRight: '0.5rem' }}>
                  {getCabinClassImage(travelCabinInfo.name.toString())}
                </div>
                <Header2 style={{ display: 'flex', margin: '0' }}>
                  {t(`TravelCabin`)} {travelCabinInfo.name.toString()}
                </Header2>
              </div>
              {isConnected ? (
                <CollapseWrapper>
                  <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                    <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={handleJoin}>
                      {t(`Buy`)}
                    </ButtonPrimary>
                  </ButtonWrapper>
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
            <SpacedSection style={{ width: '100%', marginTop: '1rem' }}>
              <SmallText>{t(`General Information`)}</SmallText>
              <BorderedWrapper style={{ marginTop: '0' }}>
                <Section>
                  <RowBetween>
                    <SText width="fit-content">{t(`TravelCabin Id`)}</SText>
                    <SText width="fit-content">{travelCabinIndex}</SText>
                  </RowBetween>
                  <RowBetween>
                    <SText width="fit-content">{t(`Travel Class`)}</SText>
                    <SText width="fit-content">{travelCabinInfo.name.toString()}</SText>
                  </RowBetween>
                  <RowBetween>
                    <SText width="fit-content">{t(`Ticket Fare`)}</SText>
                    <SText width="fit-content">
                      {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals)} {token}
                    </SText>
                  </RowBetween>
                  {expectedBlockTime && (
                    <RowBetween>
                      <SText width="fit-content">{t(`Ride Duration`)}</SText>
                      <SText width="fit-content">
                        {travelCabinInfo.maturity.toString()} {t(`Blocks`)} (~
                        {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)})
                      </SText>
                    </RowBetween>
                  )}
                </Section>
              </BorderedWrapper>
              {inventoryCount && (
                <>
                  <SmallText>{t(`Inventory`)}</SmallText>
                  <BorderedWrapper style={{ marginTop: '0' }}>
                    <Section>
                      <RowBetween>
                        <SText width="fit-content">{t(`Available`)}</SText>
                        <SText width="fit-content">{inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}</SText>
                      </RowBetween>
                      <RowBetween>
                        <SText width="fit-content">{t(`Total`)}</SText>
                        <SText width="fit-content">{inventoryCount[1].toNumber()}</SText>
                      </RowBetween>
                    </Section>
                  </BorderedWrapper>
                </>
              )}
              <SmallText>{t(`Rewards`)}</SmallText>
              <BorderedWrapper style={{ marginTop: '0' }}>
                <Section>
                  {expectedBlockTime && (
                    <RowBetween>
                      <SText width="fit-content">{t(`Total Yield`)}</SText>
                      <SText width="fit-content">
                        {`${formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals)} ${token} (${`${getApy({
                          totalYield: travelCabinInfo.yield_total.toBn(),
                          totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                          chainDecimals: chainDecimals,
                          blockTime: expectedBlockTime,
                          period: travelCabinInfo.maturity,
                          precision: 2,
                        }).toString()}% APY`})`}
                      </SText>
                    </RowBetween>
                  )}
                </Section>
              </BorderedWrapper>
            </SpacedSection>
          </Section>
        </Card>
      </ContentWrapper>
    </>
  )
}

function TravelCabinBuyers({ travelCabinIndex }: { travelCabinIndex: string }) {
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  const { expectedBlockTime, genesisTs } = useBlockManager()
  const { t } = useTranslation()

  const sortedBuyers = useMemo(() => buyers.sort((b1, b2) => b2[0][1].toNumber() - b1[0][1].toNumber()), [buyers])

  return (
    <>
      <ContentWrapper>
        <Card style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Section>
            <div style={{ display: 'flex' }}>
              <Header2 width="fit-content">{t(`Sold to`)}</Header2>
              <QuestionHelper
                size={12}
                backgroundColor={'transparent'}
                text={t(`Passengers and DPOs that have purchased this TravelCabin class. Click for more information.`)}
              />
            </div>
          </Section>
          <SpacedSection style={{ marginTop: '0' }}>
            {genesisTs &&
              expectedBlockTime &&
              sortedBuyers.map((buyer, index) => {
                return (
                  <Link
                    key={index}
                    to={{ pathname: `/item/travelCabin/${travelCabinIndex}/inventory/${buyer[0][1]}` }}
                    style={{ textDecoration: 'none' }}
                  >
                    <GridRow>
                      <GridCell>
                        <HeavyText fontSize="14px">
                          {t(`Inventory`)} #{buyer[0][1].toString()}
                        </HeavyText>
                        <ItalicText fontSize="12px">
                          {tsToRelative(
                            blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
                          )}
                        </ItalicText>
                      </GridCell>
                      <GridCell>
                        {buyer[1].buyer.isPassenger && (
                          <SText fontSize="12px">
                            {t(`Buyer`)}: {shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} ({t(`Passenger`)})
                          </SText>
                        )}
                        {buyer[1].buyer.isDpo && (
                          <SText fontSize="12px">
                            {t(`Buyer`)}: DPO #{buyer[1].buyer.asDpo.toString()}
                          </SText>
                        )}
                      </GridCell>
                    </GridRow>
                  </Link>
                )
              })}
          </SpacedSection>
        </Card>
      </ContentWrapper>
    </>
  )
}

export default function TravelCabinItem(props: TravelCabinItemProps): JSX.Element {
  const { travelCabinIndex } = props

  return (
    <>
      {travelCabinIndex && <SelectedTravelCabin travelCabinIndex={travelCabinIndex} />}
      <TravelCabinBuyers travelCabinIndex={travelCabinIndex} />
    </>
  )
}
