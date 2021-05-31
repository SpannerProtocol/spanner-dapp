import BN from 'bn.js'
import Card from 'components/Card'
import { RowBetween } from 'components/Row'
import { StatContainer, StatDisplayContainer, StatDisplayGrid, StatText, StatValue } from 'components/StatDisplay'
import { DataTokenName, Heading, Header2, SmallText, SText } from 'components/Text'
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
        <Card style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
                    <SText>{t('Total Deposit')}</SText>
                    <SText>
                      {formatToUnit(travelCabinInfo.deposit_amount.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </SText>
                  </RowBetween>
                  <RowBetween>
                    <SText>{t(`Deposit Withdrawn (Fare)`)}</SText>
                    <SText>{buyer[1].fare_withdrawn.isTrue ? t(`Yes`) : t(`No`)}</SText>
                  </RowBetween>
                  <RowBetween>
                    <SText>{t('Total Yield')}</SText>
                    <SText>
                      {formatToUnit(travelCabinInfo.yield_total.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </SText>
                  </RowBetween>
                  <RowBetween>
                    <SText>{t(`Yield Withdrawn`)}</SText>
                    <SText>
                      {formatToUnit(buyer[1].yield_withdrawn.toString(), chainDecimals, 2)}{' '}
                      {travelCabinInfo.token_id.asToken.toString()}
                    </SText>
                  </RowBetween>
                </>
              )}
              <RowBetween>
                <SText>{t(`Last Withdrawal (Block)`)}</SText>
                <SText>
                  {t(`Block`)} #{buyer[1].blk_of_last_withdraw.toString()}
                </SText>
              </RowBetween>
              {genesisTs && expectedBlockTime && (
                <RowBetween>
                  <SText>{t(`Last Withdrawal (Date & Time)`)}</SText>
                  <SText>
                    {tsToDateTime(
                      blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
                    )}
                  </SText>
                </RowBetween>
              )}
            </BorderedWrapper>
          </SpacedSection>
          <SpacedSection>
            <SmallText>{t(`General Information`)}</SmallText>
            <BorderedWrapper style={{ margin: '0' }}>
              <RowBetween>
                <SText>{t(`TravelCabin Id`)}</SText>
                <SText>{buyer[0][0].toString()}</SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Inventory Id`)}</SText>
                <SText>{buyer[0][1].toString()}</SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Purchased at`)}</SText>
                <SText>
                  {t(`Block`)} #{buyer[1].purchase_blk.toString()}
                </SText>
              </RowBetween>
              {travelCabinInfo && (
                <RowBetween>
                  <SText>{t(`Ride Ends at`)}</SText>
                  <SText>
                    {t(`Block`)} #{travelCabinInfo.maturity.add(buyer[1].purchase_blk).toString()}
                  </SText>
                </RowBetween>
              )}
              {buyer[1].buyer.isPassenger && (
                <>
                  <RowBetween>
                    <SText>{t(`Buyer`)}</SText>
                    <SText>{truncateString(buyer[1].buyer.asPassenger.toString(), 14)}</SText>
                  </RowBetween>
                  <RowBetween>
                    <SText>{t(`User Type`)}</SText>
                    <SText>{t(`Passenger`)}</SText>
                  </RowBetween>
                </>
              )}
              {buyer[1].buyer.isDpo && (
                <>
                  <RowBetween>
                    <SText>{t(`Buyer`)}</SText>
                    <SText>{truncateString(buyer[1].buyer.asDpo.toString(), 14)}</SText>
                  </RowBetween>
                  <RowBetween>
                    <SText>{t(`User Type`)}</SText>
                    <SText>{t(`DPO`)}</SText>
                  </RowBetween>
                </>
              )}
            </BorderedWrapper>
          </SpacedSection>
        </Card>
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
                <SText>
                  {`Confirm Withdraw Ticket Fare from TravelCabin`}: {getCabinClass(travelCabinIndex)}`
                </SText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={`Withdraw Ticket Fare`}
            tip={`Your ride is complete. Withdraw Ticket Fare from TravelCabin (your deposit).`}
            actionDesc={<SText>{`Withdraw Ticket Fare from TravelCabin.`}</SText>}
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
                <SText>
                  {`Confirm Withdraw Yield from TravelCabin`}: {getCabinClass(travelCabinIndex)}`
                </SText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Withdraw Yield'}
            tip={`Yield will generate as time passes until your ride ends. Withdraw Ticket Yield from TravelCabin.`}
            actionDesc={<SText>{`Withdraw Yield from TravelCabin.`}</SText>}
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
      <Card style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <Header2>{t(`Actions`)}</Header2>
        </Section>
        <SpacedSection>
          {userActions && userActions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
        </SpacedSection>
      </Card>
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
