import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { FlatCard } from 'components/Card'
import Divider from 'components/Divider'
import { GridCell, GridRow } from 'components/Grid'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, ItalicText, SectionHeading, SmallText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, ButtonWrapper, CollapseWrapper, Section, SpacedSection } from 'components/Wrapper'
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
        {targetAmount && (
          <RowBetween>
            <StandardText>{t(`Crowdfunding Amount`)}</StandardText>
            <StandardText>
              {formatToUnit(targetAmount, chainDecimals, 2)} {token}
            </StandardText>
          </RowBetween>
        )}
        {end && endInDays && (
          <RowBetween>
            <StandardText>{t(`Crowdfunding Period`)}</StandardText>
            <StandardText fontSize="12px">{`~${t(`Block`)} #${end} (${endInDays} ${t(`days`)})`}</StandardText>
          </RowBetween>
        )}
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
          <RowBetween>
            <StandardText>{t(`Direct Referral Rate`)}</StandardText>
            <StandardText>
              {`${parseInt(directReferralRate)} (${t(`Direct`)}) + ${100 - parseInt(directReferralRate)} (${t(
                `2nd`
              )}) = 100%`}
            </StandardText>
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
            <StandardText>{t(`Referral Code`)}</StandardText>
            <StandardText>{shortenAddr(referrer, 5)}</StandardText>
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
        <StandardText>{t(`Buy this TravelCabin to start earning Rewards`)}</StandardText>
      </Section>
      <BorderedWrapper>
        <RowBetween>
          <StandardText>{t(`Ticket Fare (deposit)`)}</StandardText>
          <StandardText>
            {deposit} {token}
          </StandardText>
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
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
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
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
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
      <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <RowBetween>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', maxWidth: '25px', maxHeight: '25px', paddingRight: '0.5rem' }}>
                {getCabinClassImage(travelCabinInfo.name.toString())}
              </div>
              <SectionHeading style={{ display: 'flex', margin: '0' }}>
                {t(`TravelCabin`)} {travelCabinInfo.name.toString()}
              </SectionHeading>
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
                  <StandardText>{t(`TravelCabin Id`)}</StandardText>
                  <StandardText>{travelCabinIndex}</StandardText>
                </RowBetween>
                <RowBetween>
                  <StandardText>{t(`Travel Class`)}</StandardText>
                  <StandardText>{travelCabinInfo.name.toString()}</StandardText>
                </RowBetween>
                <RowBetween>
                  <StandardText>{t(`Ticket Fare`)}</StandardText>
                  <StandardText>
                    {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals)} {token}
                  </StandardText>
                </RowBetween>
                {expectedBlockTime && (
                  <RowBetween>
                    <StandardText>{t(`Ride Duration`)}</StandardText>
                    <StandardText>
                      {travelCabinInfo.maturity.toString()} {t(`Blocks`)} (~
                      {blockToDays(travelCabinInfo.maturity, expectedBlockTime)} {t(`days`)})
                    </StandardText>
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
                      <StandardText>{t(`Available`)}</StandardText>
                      <StandardText>{inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}</StandardText>
                    </RowBetween>
                    <RowBetween>
                      <StandardText>{t(`Total`)}</StandardText>
                      <StandardText>{inventoryCount[1].toNumber()}</StandardText>
                    </RowBetween>
                  </Section>
                </BorderedWrapper>
              </>
            )}
            <SmallText>{t(`Rewards`)}</SmallText>
            <BorderedWrapper style={{ marginTop: '0' }}>
              <Section>
                <RowBetween>
                  <StandardText>{t(`Total Bonus`)}</StandardText>
                  <StandardText>
                    {formatToUnit(travelCabinInfo.bonus_total.toString(), chainDecimals)} {token}
                  </StandardText>
                </RowBetween>
                {expectedBlockTime && (
                  <RowBetween>
                    <StandardText>{t(`Total Yield`)}</StandardText>
                    <StandardText>
                      {`${formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals)} ${token} (${`${getApy({
                        totalYield: travelCabinInfo.yield_total.toBn(),
                        totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                        chainDecimals: chainDecimals,
                        blockTime: expectedBlockTime,
                        period: travelCabinInfo.maturity,
                      }).toString()}% APY`})`}
                    </StandardText>
                  </RowBetween>
                )}
              </Section>
            </BorderedWrapper>
          </SpacedSection>
        </Section>
      </FlatCard>
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
      <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <div style={{ display: 'flex' }}>
            <SectionHeading>{t(`Sold to`)}</SectionHeading>
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
                        <StandardText fontSize="12px">
                          {t(`Buyer`)}: {shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} ({t(`Passenger`)})
                        </StandardText>
                      )}
                      {buyer[1].buyer.isDpo && (
                        <StandardText fontSize="12px">
                          {t(`Buyer`)}: DPO #{buyer[1].buyer.asDpo.toString()}
                        </StandardText>
                      )}
                    </GridCell>
                  </GridRow>
                </Link>
              )
            })}
        </SpacedSection>
      </FlatCard>
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
