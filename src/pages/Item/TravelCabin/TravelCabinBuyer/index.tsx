import BN from 'bn.js'
import { FlatCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { StatContainer, StatDisplayContainer, StatDisplayGrid, StatText, StatValue } from 'components/StatDisplay'
import { DataTokenName, Heading, SectionHeading, SmallText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, ContentWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useItemCabinBuyer } from 'hooks/useItem'
import { useSubTravelCabin, useSubTravelCabinBuyerVerbose, useTravelCabinBuyers } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import useUserActions from 'hooks/useUserActions'
import Action from 'pages/Item/actions'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { blockToTs, tsToDateTime } from 'utils/formatBlocks'
import { bnToUnit, formatToUnit } from 'utils/formatUnit'
import getCabinClass from 'utils/getCabinClass'
import truncateString from 'utils/truncateString'
import { ACTION_ICONS } from '../../../../constants'

const statsBg = 'linear-gradient(90deg, #FFBE2E -11.67%, #FF9E04 100%)'

function TravelCabinBuyersInfo({
  selectedBuyer,
}: {
  selectedBuyer: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
}) {
  const { expectedBlockTime, genesisTs, lastBlock } = useBlockManager()
  const { chainDecimals } = useSubstrate()
  const travelCabinInfo = useSubTravelCabin(selectedBuyer[0][0].toString())
  const { t } = useTranslation()
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

  return (
    <>
      {buyer && (
        <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Heading>{t(`TravelCabin Inventory`)}</Heading>
          <SpacedSection>
            <StatDisplayContainer>
              <StatDisplayGrid columns="2">
                {travelCabinInfo && (
                  <>
                    <StatContainer maxWidth="none" background={statsBg}>
                      <StatValue small={true}>
                        {formatToUnit(buyer[1].yield_withdrawn.toString(), chainDecimals, 2)} /{' '}
                        {formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals, 2)}{' '}
                        <DataTokenName color="#fff"> {travelCabinInfo.token_id.asToken.toString()}</DataTokenName>
                      </StatValue>
                      <StatText>{t(`Yield Withdrawn`)}</StatText>
                    </StatContainer>
                    {yieldAvailable && (
                      <StatContainer maxWidth="none" background={statsBg}>
                        <StatValue small={true}>
                          {yieldAvailable}
                          <DataTokenName color="#fff"> {travelCabinInfo.token_id.asToken.toString()}</DataTokenName>
                        </StatValue>
                        <StatText>{t(`Yield Available`)}</StatText>
                      </StatContainer>
                    )}
                  </>
                )}
              </StatDisplayGrid>
            </StatDisplayContainer>
          </SpacedSection>
          <SpacedSection>
            <SmallText>{t(`Cabin Inventory Vault`)}</SmallText>
            <BorderedWrapper style={{ margin: '0' }} borderColor="#EC3D3D">
              {travelCabinInfo && travelCabinInfo.token_id.isToken && (
                <>
                  <RowBetween>
                    <StandardText>{t('Total Deposit')}</StandardText>
                    <StandardText>
                      {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t(`Deposit Withdrawn (Fare)`)}</StandardText>
                    <StandardText>{buyer[1].fare_withdrawn.toString()}</StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t('Total Yield')}</StandardText>
                    <StandardText>
                      {formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t(`Yield Withdrawn`)}</StandardText>
                    <StandardText>
                      {formatToUnit(buyer[1].yield_withdrawn.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                </>
              )}
              <RowBetween>
                <StandardText>{t(`Last Withdrawal (Block)`)}</StandardText>
                <StandardText>
                  {t(`Block`)} #{buyer[1].blk_of_last_withdraw.toString()}
                </StandardText>
              </RowBetween>
              {genesisTs && expectedBlockTime && (
                <RowBetween>
                  <StandardText>{t(`Last Withdrawal (Date & Time)`)}</StandardText>
                  <StandardText>
                    {tsToDateTime(
                      blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
                    )}
                  </StandardText>
                </RowBetween>
              )}
            </BorderedWrapper>
          </SpacedSection>
          <SpacedSection>
            <SmallText>{t(`General Information`)}</SmallText>
            <BorderedWrapper style={{ margin: '0' }}>
              <RowBetween>
                <StandardText>{t(`TravelCabin Id`)}</StandardText>
                <StandardText>{buyer[0][0].toString()}</StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Inventory Id`)}</StandardText>
                <StandardText>{buyer[0][1].toString()}</StandardText>
              </RowBetween>
              <RowBetween>
                <StandardText>{t(`Purchased at`)}</StandardText>
                <StandardText>
                  {t(`Block`)} #{buyer[1].purchase_blk.toString()}
                </StandardText>
              </RowBetween>
              {travelCabinInfo && (
                <RowBetween>
                  <StandardText>{t(`Ride Ends at`)}</StandardText>
                  <StandardText>
                    {t(`Block`)} #{travelCabinInfo.maturity.add(buyer[1].purchase_blk).toString()}
                  </StandardText>
                </RowBetween>
              )}
              {buyer[1].buyer.isPassenger && (
                <>
                  <RowBetween>
                    <StandardText>{t(`Buyer`)}</StandardText>
                    <StandardText>{truncateString(buyer[1].buyer.asPassenger.toString(), 14)}</StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t(`User Type`)}</StandardText>
                    <StandardText>{t(`Passenger`)}</StandardText>
                  </RowBetween>
                </>
              )}
              {buyer[1].buyer.isDpo && (
                <>
                  <RowBetween>
                    <StandardText>{t(`Buyer`)}</StandardText>
                    <StandardText>{truncateString(buyer[1].buyer.asDpo.toString(), 14)} (DPO)</StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t(`User Type`)}</StandardText>
                    <StandardText>{t(`DPO`)}</StandardText>
                  </RowBetween>
                </>
              )}
            </BorderedWrapper>
          </SpacedSection>
        </FlatCard>
      )}
    </>
  )
}

export function UserActionProvider({
  travelCabinIndex,
  travelCabinInventoryIndex,
}: {
  travelCabinIndex: string
  travelCabinInventoryIndex: string
}) {
  const { actions, travelCabinInfo } = useUserActions(travelCabinIndex, travelCabinInventoryIndex)
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const [userActions, setUserActions] = useState<Array<JSX.Element>>()
  const { t } = useTranslation()

  useEffect(() => {
    if (!actions) return
    const filteredUserActions = actions.map((action) => {
      if (action.action === 'withdrawFareFromTravelCabin') {
        if (!travelCabinInfo) return undefined
        return (
          <Action
            txContent={
              <>
                <StandardText>
                  {`Confirm Withdraw Ticket Fare from TravelCabin`}: {getCabinClass(travelCabinIndex)}`
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={`Withdraw Ticket Fare`}
            tip={`Your ride is complete. Withdraw Ticket Fare from TravelCabin (your deposit).`}
            actionDesc={<StandardText>{`Withdraw Ticket Fare from TravelCabin.`}</StandardText>}
            icon={ACTION_ICONS[action.action]}
            buttonText={`Withdraw`}
            transaction={{
              section: 'bulletTrain',
              method: 'withdrawFareFromTravelCabin',
              params: { travelCabinIdx: travelCabinInfo.index, travelCabinNumber: travelCabinInventoryIndex },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      }
      if (action.action === 'withdrawYieldFromTravelCabin') {
        if (!travelCabinInfo) return undefined
        return (
          <Action
            txContent={
              <>
                <StandardText>
                  {`Confirm Withdraw Yield from TravelCabin`}: {getCabinClass(travelCabinIndex)}`
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Withdraw Yield'}
            tip={`Yield will generate as time passes until your ride ends. Withdraw Ticket Yield from TravelCabin.`}
            actionDesc={<StandardText>{`Withdraw Yield from TravelCabin.`}</StandardText>}
            icon={ACTION_ICONS[action.action]}
            buttonText={'Withdraw'}
            transaction={{
              section: 'bulletTrain',
              method: 'withdrawYieldFromTravelCabin',
              params: { travelCabinIdx: travelCabinInfo.index, travelCabinNumber: travelCabinInventoryIndex },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      }
      return undefined
    })
    if (filteredUserActions) {
      const filteredActions: JSX.Element[] = filteredUserActions.filter(
        (element: JSX.Element | undefined): element is JSX.Element => !!element
      )
      setUserActions(filteredActions)
    }
  }, [actions, estimatedFee, travelCabinIndex, travelCabinInfo, travelCabinInventoryIndex])

  return (
    <>
      <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <SectionHeading>{t(`Actions`)}</SectionHeading>
        </Section>
        <SpacedSection>
          {userActions && userActions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
        </SpacedSection>
      </FlatCard>
    </>
  )
}

export default function TravelCabinBuyer(): JSX.Element {
  const { travelCabinIndex, travelCabinInventoryIndex } = useItemCabinBuyer()
  const userActions = useUserActions(travelCabinIndex, travelCabinInventoryIndex)
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  const [selectedBuyer, setSelectedBuyer] = useState<
    [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  >()

  useEffect(() => {
    if (buyers.length === 0) return
    setSelectedBuyer(
      buyers.find((buyer) => buyer[0][0].eq(travelCabinIndex) && buyer[0][1].eq(travelCabinInventoryIndex))
    )
  }, [buyers, travelCabinIndex, travelCabinInventoryIndex])

  return (
    <>
      {selectedBuyer && <TravelCabinBuyersInfo selectedBuyer={selectedBuyer} />}
      {userActions.actions && userActions.actions.length > 0 && (
        <ContentWrapper>
          <UserActionProvider
            travelCabinIndex={travelCabinIndex}
            travelCabinInventoryIndex={travelCabinInventoryIndex}
          />
        </ContentWrapper>
      )}
    </>
  )
}
