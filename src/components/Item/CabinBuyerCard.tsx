import { HeavyText, ItalicText, StandardText } from 'components/Text'
import { InlineSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { blockToDays } from 'utils/formatBlocks'
import { getCabinClassImage } from 'utils/getCabinClass'
import { formatToUnit } from '../../utils/formatUnit'
import { CabinCard, CabinData1, CabinData2, CabinTitle, CabinWrapper, IconWrapper } from './TravelCabinCard'
import { useSubTravelCabin, useSubTravelCabinBuyer } from '../../hooks/useQueryTravelCabins'
import { getCabinYield } from 'utils/getCabinData'

interface TravelCabinCard {
  cabinIndex: string | number | TravelCabinIndex
  inventoryIndex: string | number | TravelCabinInventoryIndex
}

export default function CabinBuyerCard({ cabinIndex, inventoryIndex }: TravelCabinCard) {
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()
  const cabinInfo = useSubTravelCabin(cabinIndex)
  const buyerInfo = useSubTravelCabinBuyer(cabinIndex, inventoryIndex)
  const [yieldAvailable, setYieldAvailable] = useState<string>()

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock) return
    setYieldAvailable(getCabinYield(cabinInfo, buyerInfo, lastBlock, chainDecimals))
  }, [cabinInfo, buyerInfo, lastBlock, chainDecimals])

  const token = cabinInfo && cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.toString()

  return (
    <>
      {cabinInfo && (
        <CabinWrapper>
          <Link
            to={`/item/travelcabin/${cabinInfo.index.toString()}/inventory/${inventoryIndex}`}
            style={{ textDecoration: 'none' }}
          >
            <CabinCard>
              <IconWrapper>{getCabinClassImage(cabinInfo.name.toString())}</IconWrapper>
              <CabinTitle>
                <div style={{ display: 'block' }}>
                  <HeavyText style={{ marginLeft: '0', marginTop: '0', width: '100%' }}>
                    {t(`TravelCabin `)}
                    {cabinInfo.name.toString()}
                  </HeavyText>
                  <ItalicText fontSize="10px" style={{ width: '100%' }}>
                    {t(`Inventory`)} #{inventoryIndex.toString()}
                  </ItalicText>
                </div>
              </CabinTitle>
              <CabinData1>
                <InlineSection>
                  <HeavyText fontSize={'12px'}>{t(`Fare`)}:</HeavyText>
                  <StandardText fontSize={'12px'} paddingLeft={'0.5rem'}>
                    {formatToUnit(cabinInfo.deposit_amount.toBn(), chainDecimals, 2)} {token}
                  </StandardText>
                </InlineSection>
                {expectedBlockTime && (
                  <InlineSection>
                    <HeavyText fontSize={'12px'}>{t(`Trip`)}:</HeavyText>
                    <StandardText fontSize={'12px'} paddingLeft={'0.5rem'}>
                      {blockToDays(cabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}
                    </StandardText>
                  </InlineSection>
                )}
              </CabinData1>
              <CabinData2>
                <InlineSection>
                  <HeavyText fontSize={'12px'}>{t(`Yield`)}:</HeavyText>
                  <StandardText fontSize={'12px'} paddingLeft={'0.5rem'}>
                    {`${yieldAvailable} ${token}`}
                  </StandardText>
                </InlineSection>
                {buyerInfo && (
                  <InlineSection>
                    <HeavyText fontSize={'12px'}>{t(`Bonus`)}:</HeavyText>
                    <StandardText fontSize={'12px'} paddingLeft={'0.5rem'}>
                      {!buyerInfo.fare_withdrawn
                        ? `0 ${token}`
                        : formatToUnit(cabinInfo.bonus_total.toString(), chainDecimals, 2) + ` ${token}`}
                    </StandardText>
                  </InlineSection>
                )}
              </CabinData2>
            </CabinCard>
          </Link>
        </CabinWrapper>
      )}
    </>
  )
}
