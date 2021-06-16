import { useProjectManager } from '../../state/project/hooks'
import { useSubstrate } from '../../hooks/useSubstrate'
import { useSubTravelCabinInventory, useTravelCabins } from '../../hooks/useQueryTravelCabins'
import React, { useMemo } from 'react'
import { getCabinClassImage, getCabinOrder } from '../../utils/getCabinClass'
import { HeavyText, SText } from '../../components/Text'
import { ButtonWrapper, GridWrapper } from '../../components/Wrapper'
import { TravelCabinInfo } from 'interfaces/bulletTrain'
import { useBlockManager } from '../../hooks/useBlocks'
import { useTranslation } from 'react-i18next'
import cdDivide from '../../utils/cdDivide'
import { FlatCard } from '../../components/Card'
import Row, { RowBetween } from '../../components/Row'
import { IconWrapper } from '../../components/Item/TravelCabinCard'
import { ReactComponent as Ticket } from '../../assets/svg/ticket.svg'
import { formatToUnit } from '../../utils/formatUnit'
import getApy from '../../utils/getApy'
import { blockToDays } from '../../utils/formatBlocks'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'


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
      <HeavyText fontSize={'18px'} mobileFontSize={'18px'}
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
  const inventoryCount = useSubTravelCabinInventory(travelCabinInfo.index)

  const bonusPercent = Math.floor(
    cdDivide(travelCabinInfo.bonus_total, travelCabinInfo.deposit_amount, chainDecimals) * 100
  )
  return (
    <FlatCard style={{ textAlign: 'left', padding: '1rem 2rem' }}>
      <RowBetween>
        <IconWrapper>
          <div style={{ maxWidth: '45px', width: '45px' }}>{getCabinClassImage(travelCabinInfo.name.toString())}</div>
        </IconWrapper>
        <div style={{textAlign:'right'}}>
          <HeavyText fontSize={'16px'} mobileFontSize={'16px'} style={{ float: 'right' }}>
            {`${t(`TravelCabin`)} ${travelCabinInfo.name.toString()}`}
          </HeavyText>
          <Row style={{ justifyContent: 'flex-end',textAlign:'right' }} padding={'0.5rem 0rem'}>
            <Ticket />
            <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0 0 0 0.5rem'} width={'fit-content'}>
              {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)} {token}
            </SText>
          </Row>
        </div>
      </RowBetween>
      <RowBetween padding={'1rem 0.5rem 0.5rem 0.5rem'}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>{t(`APY`)}</HeavyText>
        <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}> {expectedBlockTime && (
          <>
            {`${getApy({
              totalYield: travelCabinInfo.yield_total.toBn(),
              totalDeposit: travelCabinInfo.deposit_amount.toBn(),
              chainDecimals: chainDecimals,
              blockTime: expectedBlockTime,
              period: travelCabinInfo.maturity
            })}%`}
          </>
        )}</SText>
      </RowBetween>
      <RowBetween padding={'0.5rem 0.5rem'}>
        <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`Bonus`)}</HeavyText>
        <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>{bonusPercent}%</SText>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween padding={'0.5rem 0.5rem'}>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>{t(`Trip`)}</HeavyText>
          <SText
            fontSize={'14px'}
            mobileFontSize={'14px'} width={'fit-content'}>  {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}</SText>
        </RowBetween>
      )}
      {inventoryCount && (
        <RowBetween padding={'0.5rem 0.5rem'}>
          <HeavyText fontSize={'14px'} mobileFontSize={'14px'}>{t(`Available`)}</HeavyText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
            {`${inventoryCount[1].toNumber() - inventoryCount[0].toNumber()}/${inventoryCount[1].toNumber()}`}
          </SText>
        </RowBetween>
      )}
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
