import React, { useContext, useMemo } from 'react'
import { ButtonWrapper, GridWrapper, PageWrapper, Section, Wrapper } from '../../components/Wrapper'
import { Heading, HeavyText, StandardText } from '../../components/Text'
import styled, { ThemeContext } from 'styled-components'
import { FlatCard } from '../../components/Card'
import Row, { RowBetween } from '../../components/Row'
import { LinearProgressBar } from '../../components/ProgressBar'
import { makeStyles } from '@material-ui/core/styles'
import {
  TravelCabinBuyerInfo,
  TravelCabinIndex,
  TravelCabinInfo,
  TravelCabinInventoryIndex
} from 'interfaces/bulletTrain'
import { useProjectManager } from '../../state/project/hooks'
import { useSubstrate } from '../../hooks/useSubstrate'
import { useTravelCabinBuyers, useTravelCabins } from '../../hooks/useQueryTravelCabins'
import { getCabinClassImage, getCabinOrder } from '../../utils/getCabinClass'
import { useBlockManager } from '../../hooks/useBlocks'
import { useTranslation } from 'react-i18next'
import { IconWrapper } from '../../components/Item/TravelCabinCard'
import { formatToUnit } from '../../utils/formatUnit'

import { ReactComponent as Ticket } from '../../assets/svg/ticket.svg'
import { blockToDays, blockToTs, tsToRelative } from '../../utils/formatBlocks'
import cdDivide from '../../utils/cdDivide'
import getApy from '../../utils/getApy'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { shortenAddr } from '../../utils/truncateString'
import { Link } from 'react-router-dom'

const PageTitle = styled.h1`
  margin: 0.1rem 0rem;
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 0.5rem;
  color: ${({ theme }) => theme.black};
`

export const HomeContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `};
`

export default function BulletTrain() {
  return (
    <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ margin: '1rem 0rem', textAlign: 'center' }}>
          <Section>
            <PageTitle>{'Spanner BulletTrain'}</PageTitle>
            <Heading>{'An evolutionary viral growth marketing model '}</Heading>
          </Section>
        </div>

        <HomeContentWrapper>
          <SpannerBulletTrainStats />
          <GlobalMilestoneReward />
          <CabinsCatalogue></CabinsCatalogue>
          <SoldTo></SoldTo>
        </HomeContentWrapper>
      </Wrapper>
    </PageWrapper>
  )

}

export function SpannerBulletTrainStats() {
  const theme = useContext(ThemeContext)

  return (
    <FlatCard style={{ textAlign: 'left' }}>
      <HeavyText fontSize={'24px'} mobileFontSize={'24px'} color={theme.primary1}
                 style={{ margin: 'auto' }}>{'100,000,000 BOLT'}</HeavyText>
      <StandardText fontSize={'16px'} mobileFontSize={'16px'} padding={'0rem 0rem 1rem 0rem'}
                    style={{ margin: 'auto' }}>{'Total Deposited Value'}</StandardText>
      <RowBetween>
        <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'10,049,009 BOLT'}</HeavyText>
        <StandardText>{'Total Yield Distributed'}</StandardText>
      </RowBetween>
      <RowBetween>
        <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1}>{'48,948,998 BOLT'}</HeavyText>
        <StandardText>{'Total Bonus Distributed'}</StandardText>
      </RowBetween>
    </FlatCard>
  )
}


const lineProcessBarStyle = makeStyles({
  root: {
    height: 16,
    borderRadius: 16
  }
})

export function GlobalMilestoneReward() {
  const theme = useContext(ThemeContext)
  const classes = lineProcessBarStyle()

  return (
    <FlatCard style={{ textAlign: 'left' }}>
      <HeavyText fontWeight={'700'} fontSize={'14px'} mobileFontSize={'14px'}>{'Global Milestone Reward'}</HeavyText>
      <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1} padding={'2rem 0rem 1rem 0rem'}
                 style={{ margin: 'auto' }}>{'100,000,000 BOLT'}</HeavyText>
      <StandardText fontSize={'14px'} mobileFontSize={'14px'} padding={'0rem 0rem 3rem 0rem'}
                    style={{ margin: 'auto' }}>{'Total Milestone Reward Distributed'}</StandardText>
      <RowBetween>
        <StandardText fontSize={'12px'} mobileFontSize={'12px'}>{'Current:2.38M'}</StandardText>
        <StandardText fontSize={'12px'} mobileFontSize={'12px'}>{'Next:5.38M'}</StandardText>
      </RowBetween>

      <div style={{ margin: '1rem 0rem' }}>
        <LinearProgressBar color={'secondary'} classes={{ root: classes.root }}
                           value={parseFloat((2.38 / 5.38 * 100).toFixed(0))} />
      </div>
      <HeavyText style={{ margin: 'auto' }} fontSize={'12px'} mobileFontSize={'12px'}
                 padding={'1rem 0rem'}>{'Get involved and get more rewards'}</HeavyText>
    </FlatCard>
  )
}


export function CabinsCatalogue() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabins = useTravelCabins(projectState.selectedProject?.token)

  const sortedCabins = useMemo(
    () => travelCabins.sort((t1, t2) => getCabinOrder(t1[1].name.toString()) - getCabinOrder(t2[1].name.toString())),
    [travelCabins]
  )

  return (
    <>
      <HeavyText fontWeight={'700'} fontSize={'18px'} mobileFontSize={'18px'}
                 padding={'2rem 0rem'}>{'Cabins'}</HeavyText>
      <GridWrapper columns='2'>
        {sortedCabins.map((entry, index) => {
          const travelCabinInfo = entry[1]
          const token = travelCabinInfo.token_id.isToken
            ? travelCabinInfo.token_id.asToken.toString()
            : travelCabinInfo.token_id.asDexShare.toString()
          return <CabinCard key={index} item={entry[1]} token={token} chainDecimals={chainDecimals} />
        })}
      </GridWrapper>
    </>
  )
}

interface TravelCabinCard {
  item: TravelCabinInfo
  chainDecimals: number
  token: string
}


export function CabinCard(props: TravelCabinCard) {
  const { item, chainDecimals, token } = props
  const travelCabinInfo = item
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  const bonusPercent = Math.floor(
    cdDivide(travelCabinInfo.bonus_total, travelCabinInfo.deposit_amount, chainDecimals) * 100
  )
  return (
    <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
      <RowBetween>
        <IconWrapper>
          <div style={{ maxWidth: '45px', width: '45px' }}>{getCabinClassImage(travelCabinInfo.name.toString())}</div>
        </IconWrapper>
        <div>
          <HeavyText fontSize={'16px'} mobileFontSize={'16px'} style={{ float: 'right' }}>
            {`${t(`TravelCabin`)} ${travelCabinInfo.name.toString()}`}
          </HeavyText>
          <Row style={{ justifyContent: 'flex-end' }} padding={'0.5rem 0rem'}>
            <Ticket />
            <StandardText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'}>
              {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)} {token}
            </StandardText>
          </Row>
        </div>
      </RowBetween>
      <RowBetween padding={'1rem 0.5rem 0.5rem 0.5rem'}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`APY`)}</HeavyText>
        <StandardText fontSize={'14px'} mobileFontSize={'14px'}> {expectedBlockTime && (
          <>
            {`${getApy({
              totalYield: travelCabinInfo.yield_total.toBn(),
              totalDeposit: travelCabinInfo.deposit_amount.toBn(),
              chainDecimals: chainDecimals,
              blockTime: expectedBlockTime,
              period: travelCabinInfo.maturity
            })}%`}
          </>
        )}</StandardText>
      </RowBetween>
      <RowBetween padding={'0.5rem 0.5rem'}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`Bonus`)}</HeavyText>
        <StandardText fontSize={'14px'} mobileFontSize={'14px'}>{bonusPercent}%</StandardText>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween padding={'0.5rem 0.5rem'}>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`Trip`)}</HeavyText>
          <StandardText
            fontSize={'14px'}
            mobileFontSize={'14px'}>  {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}</StandardText>
        </RowBetween>
      )}
      <RowBetween padding={'0.5rem 0.5rem'}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`Available`)}</HeavyText>
        <StandardText fontSize={'14px'} mobileFontSize={'14px'}>40/500</StandardText>
      </RowBetween>
      <Row style={{ alignItems: 'stretch', justifyContent: 'space-around' }} marginTop={'1.5rem'}>
        <ButtonWrapper style={{ width: '100px', padding: '0.5rem', flexGrow: 3 }}>
          <ButtonPrimary padding='1rem' fontSize='14px' mobileFontSize='14px'>
            {t(`Create`)}
          </ButtonPrimary>
        </ButtonWrapper>
        <ButtonWrapper style={{ width: '100px', padding: '0.5rem', flexGrow: 1 }}>
          <ButtonSecondary padding='1rem' fontSize='14px' mobileFontSize='14px'>
            {t(`Buy`)}
          </ButtonSecondary>
        </ButtonWrapper>
      </Row>

    </FlatCard>
  )
}


// todo :query all cabin buyer
export function SoldTo() {
  const travelCabinIndex = '0'
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  // const { expectedBlockTime, genesisTs } = useBlockManager()
  // const { t } = useTranslation()

  const sortedBuyers = useMemo(() => buyers.sort((b1, b2) => b2[0][1].toNumber() - b1[0][1].toNumber()), [buyers])

  return (
    <>
      <HeavyText fontWeight={'700'} fontSize={'18px'} mobileFontSize={'18px'}
                 padding={'2rem 0rem'}>{'Sold To'}</HeavyText>
      {sortedBuyers.map((buyer, index) => {
        return (<SoldToItem buyer={buyer} index={index} />)
      })}
    </>
  )
}


interface CabinSoldToProps {
  buyer: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  index: number
}


export function SoldToItem(props: CabinSoldToProps) {

  const { expectedBlockTime, genesisTs } = useBlockManager()
  const { buyer, index } = props
  const buyerInfo = buyer[1]
  const cabinIndex = buyer[0][0]
  const cabinInventoryIndex = buyer[0][1]
  const { t } = useTranslation()
  return (
    <>
      <Link
        key={index}
        to={{ pathname: `/item/travelCabin/${cabinIndex}/inventory/${cabinInventoryIndex}` }}
        style={{ textDecoration: 'none' }}
      >
        <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
          <RowBetween>
            <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>
              {`${t(`TravelCabin`)} ${`Diamond`} ${`#`}${cabinInventoryIndex.toString()}`}
            </HeavyText>
            <StandardText fontSize={'14px'} mobileFontSize={'14px'}>
              {genesisTs &&
              expectedBlockTime && tsToRelative(
                blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
              )}</StandardText>
          </RowBetween>
          <StandardText fontSize={'14px'} mobileFontSize={'14px'} padding={'0.6rem 0rem'}>
            {buyerInfo.buyer.isPassenger && (`${t(`Buyer`)}: ${shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} (${t(`Passenger`)})`)}
            {buyerInfo.buyer.isDpo && (`${t(`Buyer`)}: DPO #${buyer[1].buyer.asDpo.toString()}`)}
          </StandardText>
        </FlatCard>
      </Link>
    </>
  )
}



