import { HeavyText, SText } from 'components/Text'
import { InlineSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { blocksToCountDown, blockToDays } from 'utils/formatBlocks'
import { getCabinClassImage } from 'utils/getCabinClass'
import { getCabinYield } from 'utils/getCabinData'
import { useSubTravelCabin, useSubTravelCabinBuyer } from '../../hooks/useQueryTravelCabins'
import { formatToUnit } from '../../utils/formatUnit'
import {
  CabinAction,
  CabinCard,
  CabinData1,
  CabinData2,
  CabinTitle,
  CabinWrapper,
  IconWrapper,
} from './TravelCabinCard'
import useUserActions from '../../hooks/useUserActions'
import { AlertIcon, AlertWrapper } from '../../pages/Account/Alert'
import { ACTION_ICONS } from '../../constants'
import BN from 'bn.js'

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
  const { actions } = useUserActions(cabinIndex, inventoryIndex)
  const [leftBlock, setLeftBlock] = useState<BN>()

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock) return
    setYieldAvailable(getCabinYield(cabinInfo, buyerInfo, lastBlock, chainDecimals))
  }, [cabinInfo, buyerInfo, lastBlock, chainDecimals])

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock) return
    const leftNumber = buyerInfo.purchase_blk.add(cabinInfo.maturity).sub(lastBlock)
    setLeftBlock(leftNumber)
  }, [cabinInfo, buyerInfo, lastBlock])

  const token = cabinInfo && cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.toString()

  const withdrawnFormat = buyerInfo ? formatToUnit(buyerInfo.yield_withdrawn.toString(), chainDecimals, 2) : ''
  const yieldTotalFormat = cabinInfo ? formatToUnit(cabinInfo.yield_total.toString(), chainDecimals, 2) : ''

  return (
    <>
      {cabinInfo && (
        <CabinWrapper>
          <Link
            to={`/assets/travelcabin/${cabinInfo.index.toString()}/inventory/${inventoryIndex}`}
            style={{ textDecoration: 'none' }}
          >
            <CabinCard>
              <IconWrapper>{getCabinClassImage(cabinInfo.name.toString())}</IconWrapper>
              <CabinTitle>
                <div style={{ display: 'block' }}>
                  <HeavyText style={{ marginLeft: '0', marginTop: '0', width: '100%' }}>
                    {`${t(`TravelCabin`)}: ${cabinInfo.name.toString()} #${inventoryIndex.toString()}`}
                  </HeavyText>
                </div>
              </CabinTitle>
              <CabinData1>
                <InlineSection>
                  <HeavyText width="fit-content">{t(`Fare`)}:</HeavyText>
                  <SText width="fit-content" padding={'0 0.5rem'}>
                    {formatToUnit(cabinInfo.deposit_amount.toBn(), chainDecimals, 2)} {token}
                  </SText>
                </InlineSection>
                {expectedBlockTime && (
                  <InlineSection>
                    <HeavyText width="fit-content">{t(`Trip`)}:</HeavyText>
                    <SText width="fit-content" padding={'0 0.5rem'}>
                      {blockToDays(cabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}
                    </SText>
                  </InlineSection>
                )}
              </CabinData1>
              <CabinData2>
                {yieldAvailable && parseFloat(yieldAvailable) > 0 ? (
                  <InlineSection>
                    <HeavyText width="fit-content">{t(`Yield Available`)}:</HeavyText>
                    <SText width="fit-content" padding={'0 0.5rem'}>
                      {`${yieldAvailable} ${token}`}
                    </SText>
                  </InlineSection>
                ) : (
                  <InlineSection>
                    <HeavyText width="fit-content">{t(`Yield Withdrawn`)}:</HeavyText>
                    <SText width="fit-content" padding={'0 0.5rem'}>
                      {`${withdrawnFormat}/${yieldTotalFormat} ${token}`}
                    </SText>
                  </InlineSection>
                )}

                {expectedBlockTime && leftBlock && (
                  <InlineSection>
                    <HeavyText>{`${t(`Time left`)}:`}</HeavyText>
                    <SText style={{ paddingLeft: '0.5rem' }}>
                      {blocksToCountDown(leftBlock, expectedBlockTime, t('End'), ['m', 's'])}
                    </SText>
                  </InlineSection>
                )}
              </CabinData2>
              {actions && actions.length > 0 && (
                <CabinAction>
                  <InlineSection style={{ alignItems: 'center' }}>
                    <HeavyText width="fit-content">{t(`Actions`)}:</HeavyText>
                    {actions.map((action, index) => (
                      <AlertWrapper key={index} padding="0" style={{ paddingLeft: '0.5rem' }}>
                        <AlertIcon src={ACTION_ICONS[action.action]} />
                      </AlertWrapper>
                    ))}
                  </InlineSection>
                </CabinAction>
              )}
            </CabinCard>
          </Link>
        </CabinWrapper>
      )}
    </>
  )
}
