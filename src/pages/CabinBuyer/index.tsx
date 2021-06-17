import { ButtonWrapper, PageWrapper, Section, Wrapper } from '../../components/Wrapper'
import { HeavyText, SText } from '../../components/Text'
import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Row, { RowBetween } from '../../components/Row'
import { IconWrapper } from '../../components/Item/TravelCabinCard'
import { getCabinClassImage } from '../../utils/getCabinClass'
import { ReactComponent as Ticket } from '../../assets/svg/ticket.svg'
import { FlatCard } from '../../components/Card'
import { useTranslation } from 'react-i18next'
import { ButtonGray, ButtonPrimary } from '../../components/Button'
import { useItemCabinBuyer } from '../../hooks/useItem'
import { useSubTravelCabin, useTravelCabinBuyers } from '../../hooks/useQueryTravelCabins'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'interfaces/bulletTrain'
import { formatToUnit } from '../../utils/formatUnit'
import { useSubstrate } from '../../hooks/useSubstrate'
import { shortenAddr } from '../../utils/truncateString'
import { useBlockManager } from '../../hooks/useBlocks'
import { blockToTs, tsToDateTime, tsToRelative } from '../../utils/formatBlocks'

export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`
export default function TravelCabinBuyer() {
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
                {'Spanner TravelCabin Inventory'}
              </HeavyText>
            </Section>
          </div>

          <HomeContentWrapper>
            <CabinInfo />
            <YieldAvailable />
            <FareAvailable />
            <Trip />
            <Activity />
          </HomeContentWrapper>
        </Wrapper>
      </PageWrapper>
    </>
  )
}

export function CabinInfo() {
  const { t } = useTranslation()
  const { travelCabinIndex, travelCabinInventoryIndex } = useItemCabinBuyer()
  const travelCabinInfo = useSubTravelCabin(travelCabinIndex)
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  const [selectedBuyer, setSelectedBuyer] = useState<
    [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  >()
  const { chainDecimals } = useSubstrate()

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
      <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
        {travelCabinInfo && (
          <RowBetween>
            <IconWrapper>
              <div
                style={{
                  maxWidth: '45px',
                  width: '45px',
                }}
              >
                {getCabinClassImage(travelCabinInfo.name.toString())}
              </div>
            </IconWrapper>
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

export function YieldAvailable() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
          {'Yield Available'}
        </HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>
            {'100,000,000 BOLT'}
          </HeavyText>
          <ButtonWrapper style={{ width: '100px', padding: '0.5rem' }}>
            <ButtonPrimary padding="1rem" fontSize="14px" mobileFontSize="14px">
              {t(`Withdraw`)}
            </ButtonPrimary>
          </ButtonWrapper>
        </RowBetween>
        <SText fontSize={'12px'} mobileFontSize={'12px'}>
          {`Withdrawn:${'0/70'} BOLT`}
        </SText>
      </FlatCard>
    </>
  )
}

export function FareAvailable() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
          {'Fare Available'}
        </HeavyText>
        <RowBetween padding={'1.5rem 0rem'}>
          <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>
            {'0 BOLT'}
          </HeavyText>
          <ButtonWrapper style={{ width: '100px', padding: '0.5rem' }}>
            <ButtonGray padding="1rem" fontSize="14px" mobileFontSize="14px">
              {t(`Withdraw`)}
            </ButtonGray>
          </ButtonWrapper>
        </RowBetween>
        <SText fontSize={'12px'} mobileFontSize={'12px'}>
          {`Withdrawn:${'0/70'} BOLT`}
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

export function Trip() {
  const { travelCabinIndex, travelCabinInventoryIndex } = useItemCabinBuyer()
  const travelCabinInfo = useSubTravelCabin(travelCabinIndex)
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  const [selectedBuyer, setSelectedBuyer] = useState<
    [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  >()
  const { expectedBlockTime, genesisTs, lastBlock } = useBlockManager()

  useEffect(() => {
    if (buyers.length === 0) return
    setSelectedBuyer(
      buyers.find((buyer) => buyer[0][0].eq(travelCabinIndex) && buyer[0][1].eq(travelCabinInventoryIndex))
    )
  }, [buyers, travelCabinIndex, travelCabinInventoryIndex])

  if (!travelCabinInfo || !selectedBuyer || !lastBlock) return <></>
  const remainBlock = travelCabinInfo.maturity.add(selectedBuyer[1].purchase_blk).toNumber() - lastBlock.toNumber()

  return (
    <>
      <HeavyText fontSize={'18px'} mobileFontSize={'18px'} padding={'2rem 0rem'}>
        {'Trip'}
      </HeavyText>

      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <Row justifyContent={'flex-end'}>
          <SText fontSize={'14px'} mobileFontSize={'14px'}>
            {/*{`block:204324`}*/}
          </SText>
        </Row>
        <SText fontSize={'14px'} mobileFontSize={'14px'} style={{ margin: 'auto' }}>
          {genesisTs && expectedBlockTime && selectedBuyer && travelCabinInfo && remainBlock > 0
            ? `${tsToRelative(
                blockToTs(
                  genesisTs,
                  expectedBlockTime.toNumber(),
                  travelCabinInfo.maturity.add(selectedBuyer[1].purchase_blk).toNumber()
                ) / 1000
              )}`
            : ` `}
        </SText>
        <div>
          {genesisTs && expectedBlockTime && selectedBuyer && travelCabinInfo && (
            <RowBetween>
              <TripDiv>
                <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                  {`Start`}
                </HeavyText>
                <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                  {tsToDateTime(
                    blockToTs(genesisTs, expectedBlockTime.toNumber(), selectedBuyer[1].purchase_blk.toNumber()) / 1000
                  )}
                </SText>
              </TripDiv>
              <TripDiv>
                <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                  {`End`}
                </HeavyText>
                <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
                  {tsToDateTime(
                    blockToTs(
                      genesisTs,
                      expectedBlockTime.toNumber(),
                      travelCabinInfo.maturity.add(selectedBuyer[1].purchase_blk).toNumber()
                    ) / 1000
                  )}
                </SText>
              </TripDiv>
            </RowBetween>
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
  return (
    <>
      <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
        <RowBetween>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {`Withdraw`}
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
