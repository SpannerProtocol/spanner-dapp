import { useBlockManager } from '../../hooks/useBlocks'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FlatCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { HeavyText, SText } from '../../components/Text'
import { blockToTs, tsToRelative } from '../../utils/formatBlocks'
import { shortenAddr } from '../../utils/truncateString'
import React, { useMemo } from 'react'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'interfaces/bulletTrain'
import { useTravelCabinBuyers } from '../../hooks/useQueryTravelCabins'



// todo :query all cabin buyer
export function SoldTo() {
  const travelCabinIndex = '0'
  const buyers = useTravelCabinBuyers(travelCabinIndex)
  // const { expectedBlockTime, genesisTs } = useBlockManager()
  // const { t } = useTranslation()

  const sortedBuyers = useMemo(() => buyers.sort((b1, b2) => b2[0][1].toNumber() - b1[0][1].toNumber()), [buyers])

  return (
    <>
      <HeavyText fontSize={'18px'} mobileFontSize={'18px'}
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
        <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
          <RowBetween>
            <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
              {`${t(`TravelCabin`)} ${`Diamond`} ${`#`}${cabinInventoryIndex.toString()}`}
            </HeavyText>
            <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
              {genesisTs &&
              expectedBlockTime && tsToRelative(
                blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
              )}</SText>
          </RowBetween>
          <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0.6rem 0rem'}>
            {buyerInfo.buyer.isPassenger && (`${t(`Buyer`)}: ${shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} (${t(`Passenger`)})`)}
            {buyerInfo.buyer.isDpo && (`${t(`Buyer`)}: DPO #${buyer[1].buyer.asDpo.toString()}`)}
          </SText>
        </FlatCard>
      </Link>
    </>
  )
}