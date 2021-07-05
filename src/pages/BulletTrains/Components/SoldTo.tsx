import { useExpectedBlockTime, useGenesisTime } from '../../../hooks/useBlocks'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FlatCard } from '../../../components/Card'
import { RowBetween } from '../../../components/Row'
import { HeavyText, SText } from '../../../components/Text'
import { blockToTs, tsToRelative } from '../../../utils/formatBlocks'
import { shortenAddr } from '../../../utils/truncateString'
import React, { useMemo } from 'react'
import { TravelCabinBuyerInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'interfaces/bulletTrain'
import { useTravelCabinBuyers } from '../../../hooks/useQueryTravelCabins'
import { getCabinClassByIndex } from '../../../utils/getCabinClass'
import { Moment } from '@polkadot/types/interfaces'
import StandardModal from '../../../components/Modal/StandardModal'

interface CabinSoldToProps {
  buyer: [[TravelCabinIndex, TravelCabinInventoryIndex], TravelCabinBuyerInfo]
  index: number
  expectedBlockTime?: Moment
  genesisTs?: number
}

export function SoldToItem(props: CabinSoldToProps) {
  const { buyer, index, genesisTs, expectedBlockTime } = props
  const buyerInfo = buyer[1]
  const cabinIndex = buyer[0][0]
  const cabinInventoryIndex = buyer[0][1]
  const { t } = useTranslation()
  const cabinClass = getCabinClassByIndex(cabinIndex.toString())
  return (
    <>
      <Link
        key={index}
        to={{ pathname: `/assets/travelCabin/${cabinIndex}/inventory/${cabinInventoryIndex}` }}
        style={{ textDecoration: 'none' }}
      >
        <FlatCard style={{ textAlign: 'left', padding: '1rem 1rem' }}>
          <RowBetween>
            <HeavyText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
              {`${t(`TravelCabin`)} ${cabinClass} ${`#`}${cabinInventoryIndex.toString()}`}
            </HeavyText>
            <SText fontSize={'14px'} mobileFontSize={'14px'} width={'fit-content'}>
              {genesisTs &&
                expectedBlockTime &&
                tsToRelative(
                  blockToTs(genesisTs, expectedBlockTime.toNumber(), buyer[1].purchase_blk.toNumber()) / 1000
                )}
            </SText>
          </RowBetween>
          <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0.6rem 0rem'}>
            {buyerInfo.buyer.isPassenger &&
              `${t(`Buyer`)}: ${shortenAddr(buyer[1].buyer.asPassenger.toString(), 7)} (${t(`Passenger`)})`}
            {buyerInfo.buyer.isDpo && `${t(`Buyer`)}: DPO #${buyer[1].buyer.asDpo.toString()}`}
          </SText>
        </FlatCard>
      </Link>
    </>
  )
}

export function SoldToModal({
  cabinIndex,
  isOpen,
  onDismiss,
}: {
  cabinIndex: TravelCabinIndex
  isOpen: boolean
  onDismiss: () => void
}) {
  const { t } = useTranslation()

  const buyers = useTravelCabinBuyers(cabinIndex)
  const sortedBuyers = useMemo(
    () => buyers.sort((b1, b2) => b2[1].purchase_blk.toNumber() - b1[1].purchase_blk.toNumber()),
    [buyers]
  )

  const expectedBlockTime = useExpectedBlockTime()
  const genesisTs = useGenesisTime()

  return (
    <StandardModal title={t('Inventory')} isOpen={isOpen} onDismiss={onDismiss} desktopScroll={true}>
      {sortedBuyers.map((buyer, index) => {
        return (
          <SoldToItem
            key={index}
            buyer={buyer}
            index={index}
            expectedBlockTime={expectedBlockTime}
            genesisTs={genesisTs}
          />
        )
      })}
    </StandardModal>
  )
}
