import { BN_HUNDRED } from '@polkadot/util'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { FlatCard } from 'components/Card'
import { GridCell, GridRow } from 'components/Grid'
import { BorderedInput } from 'components/Input'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { SectionHeading, SmallText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, ButtonWrapper, CollapseWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubTravelCabin, useSubTravelCabinInventory, useTravelCabinBuyers } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinInfo } from 'spanner-interfaces'
import { useReferrer } from 'hooks/useReferrer'
import { blockToDays, blockToTs, tsToRelative } from '../../../utils/formatBlocks'
import { formatToUnit } from '../../../utils/formatUnit'
import getApy from '../../../utils/getApy'
import getCabinClass, { getCabinClassImage } from '../../../utils/getCabinClass'
import truncateString, { shortenAddr } from '../../../utils/truncateString'

interface TravelCabinItemProps {
  travelCabinIndex: string
}

interface TravelCabinCrowdFormProps {
  travelCabinInfo: TravelCabinInfo
  token: string
  chainDecimals: number
  onSubmit: (data: any) => void
}

interface TravelCabinJoinTxConfirmProps {
  deposit: string
  token: string
  estimatedFee?: string
  errorMsg?: string
}

function TravelCabinCrowdfundForm({ travelCabinInfo, token, chainDecimals, onSubmit }: TravelCabinCrowdFormProps) {
  const [managerSeats, setManagerSeats] = useState<string | null>('')
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

  const handleSubmit = () => onSubmit({ managerSeats, end, dpoName, referrer: referralCode })

  useEffect(() => {
    if (!referralCode && referrer) {
      setReferralCode(referrer)
    }
  }, [referralCode, referrer])

  return (
    <>
      <Section>
        <StandardText>{t(`Create a DPO to Crowdfund for this TravelCabin's Join Requirement.`)}</StandardText>
      </Section>
      <SpacedSection>
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
              {formatToUnit(travelCabinInfo.deposit_amount.toBn().div(BN_HUNDRED), chainDecimals, 2)} {token}
            </StandardText>
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
            <StandardText>{t(`Manager Seats in DPO`)}</StandardText>
            <QuestionHelper
              text={t(
                `The # of Seats to buy for yourself as Manager from YOUR new DPO. More seats, more commission rate off your Member's yields.`
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
          {referralCode && referrer ? (
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
      </SpacedSection>
      <SpacedSection style={{ marginTop: '1rem' }}>
        <ButtonPrimary onClick={handleSubmit}>{t(`Create DPO`)}</ButtonPrimary>
      </SpacedSection>
    </>
  )
}

interface TravelCabinCrowdfundTxConfirmProps {
  deposit: string
  dpoName: string
  managerSeats: string
  end: number
  referrer: string | null
  token: string
  errorMsg?: string
  estimatedFee?: string
}

function TravelCabinCrowdfundTxConfirm({
  deposit,
  dpoName,
  managerSeats,
  end,
  referrer,
  token,
  errorMsg,
  estimatedFee,
}: TravelCabinCrowdfundTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Create a DPO to Crowdfund for this TravelCabin.`)}</StandardText>
      </Section>
      {errorMsg ? <Section>{errorMsg}</Section> : <Section>{t(`Confirm the details below.`)}</Section>}
      <Section>
        <RowBetween>
          <StandardText>{t(`DPO Name`)}</StandardText>
          <StandardText>{dpoName}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Ticket Fare`)}</StandardText>
          <StandardText>
            {deposit} {token}
          </StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Manager Seats`)}</StandardText>
          <StandardText>{managerSeats}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`End Block`)}</StandardText>
          <StandardText>{end}</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Referral Code`)}</StandardText>
          {referrer ? (
            <StandardText>{truncateString(referrer)}</StandardText>
          ) : (
            <StandardText>{t(`None`)}</StandardText>
          )}
        </RowBetween>
      </Section>
      <TxFee fee={estimatedFee} />
    </>
  )
}

function TravelCabinJoinTxConfirm({ deposit, token, estimatedFee, errorMsg }: TravelCabinJoinTxConfirmProps) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Buy this TravelCabin to start earning Rewards`)}</StandardText>
      </Section>
      {errorMsg ? <Section>{errorMsg}</Section> : <Section>{t(`Confirm the details below.`)}</Section>}
      <SpacedSection>
        <RowBetween>
          <StandardText>{t(`Deposit Required`)}</StandardText>
          <StandardText>
            {deposit} {token}
          </StandardText>
        </RowBetween>
      </SpacedSection>
      <TxFee fee={estimatedFee} />
    </>
  )
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
  const [userDpoName, setUserDpoName] = useState<string>('')
  const [userManagerSeats, setUserManagerSeats] = useState<string>('')
  const [userEnd, setUserEnd] = useState<number>(0)
  const [userReferrer, setUserReferrer] = useState<string>('')
  const { expectedBlockTime } = useBlockManager()
  // const { queueTransaction } = useTransactionMsg()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { t } = useTranslation()

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
    end,
    referrer,
  }: {
    dpoName: string
    managerSeats: string
    end: number
    referrer: string
  }) => {
    setUserDpoName(dpoName)
    setUserManagerSeats(managerSeats)
    setUserEnd(end)
    setUserReferrer(referrer)
    if (!travelCabinIndex) {
      setTxErrorMsg(t(`Information provided was not sufficient.`))
    }
    const txData = createTx({
      section: 'bulletTrain',
      method: 'createDpo',
      params: { name: dpoName, target: { TravelCabin: travelCabinIndex }, managerSeats, end, referrer },
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
      <StandardModal title={t(`Create DPO`)} isOpen={crowdfundFormModalOpen} onDismiss={dismissModal}>
        <TravelCabinCrowdfundForm
          travelCabinInfo={travelCabinInfo}
          token={token}
          chainDecimals={chainDecimals}
          onSubmit={handleCrowdfundFormCallback}
        />
      </StandardModal>
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
          deposit={formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)}
          dpoName={userDpoName}
          managerSeats={userManagerSeats}
          end={userEnd}
          referrer={userReferrer}
          token={token}
          estimatedFee={txInfo?.estimatedFee}
        />
      </TxModal>
      <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <RowBetween>
            <SectionHeading style={{ display: 'flex' }}>
              {t(`TravelCabin`)}: {getCabinClass(travelCabinInfo.index.toString())}
              {getCabinClassImage(travelCabinInfo.index.toString())}
            </SectionHeading>
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
                  <StandardText>{getCabinClass(travelCabinInfo.index.toString())}</StandardText>
                </RowBetween>
                <RowBetween>
                  <StandardText>{t(`Ticket Fare`)}</StandardText>
                  <StandardText>
                    {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)} {token}
                  </StandardText>
                </RowBetween>
                {expectedBlockTime && (
                  <RowBetween>
                    <StandardText>{t(`Ride Duration`)}</StandardText>
                    <StandardText>
                      {travelCabinInfo.maturity.toString()} {t(`Blocks`)} (~
                      {blockToDays(expectedBlockTime, travelCabinInfo.maturity)} {t(`days`)})
                    </StandardText>
                  </RowBetween>
                )}
              </Section>
            </BorderedWrapper>
            {inventoryCount && (
              <>
                <SmallText>{t(`Status`)}</SmallText>
                <BorderedWrapper style={{ marginTop: '0' }}>
                  <Section>
                    <RowBetween>
                      <StandardText>{t(`Stock`)}</StandardText>
                      <StandardText>
                        {inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}/{inventoryCount[1].toNumber()}
                      </StandardText>
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
                    {formatToUnit(travelCabinInfo.bonus_total.toString(), chainDecimals, 2)} {token}
                  </StandardText>
                </RowBetween>
                {expectedBlockTime && (
                  <RowBetween>
                    <StandardText>{t(`Total Yield`)}</StandardText>
                    <StandardText>
                      {`${formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals, 2)} ${token} (${`${getApy(
                        {
                          totalYield: travelCabinInfo.yield_total.toBn(),
                          totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                          chainDecimals: chainDecimals,
                          blocksInPeriod: expectedBlockTime,
                          period: travelCabinInfo.maturity,
                        }
                      ).toString()}% APY`})`}
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
        <SpacedSection>
          {genesisTs &&
            expectedBlockTime &&
            buyers.map((buyer, index) => {
              return (
                <Link
                  key={index}
                  to={{ pathname: `/item/travelCabin/${travelCabinIndex}/inventory/${buyer[0][1]}` }}
                  style={{ textDecoration: 'none' }}
                >
                  <GridRow>
                    <GridCell>
                      <StandardText>
                        {t(`Inventory`)} #{buyer[0][1].toString()}
                      </StandardText>
                      <StandardText>
                        {tsToRelative(
                          blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
                        )}
                      </StandardText>
                    </GridCell>
                    <GridCell>
                      {buyer[1].buyer.isPassenger && (
                        <StandardText>
                          {t(`Buyer`)}: {shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} ({t(`Passenger`)})
                        </StandardText>
                      )}
                      {buyer[1].buyer.isDpo && (
                        <StandardText>
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
