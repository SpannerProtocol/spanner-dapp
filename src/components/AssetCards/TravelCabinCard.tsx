import Card from 'components/Card'
import { HeavyText, SText } from 'components/Text'
import { useBlockManager } from 'hooks/useBlocks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinInfo } from 'spanner-interfaces'
import styled from 'styled-components'
import cdDivide from 'utils/cdDivide'
import { blockToDays } from 'utils/formatBlocks'
import getApy from 'utils/getApy'
import { getCabinClassImage } from 'utils/getCabinClass'
import { formatToUnit } from '../../utils/formatUnit'

export const CabinCard = styled.div`
  display: grid;
  grid-template-areas:
    'icon icon'
    'title title'
    'data1 data2'
    'action action';
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  grid-column-gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  justify-content: center;
  text-align: center;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-areas:
    'icon title title'
    'icon data1 data2'
    'icon action action';
    grid-template-columns: minmax(40px, 40px) auto;
    grid-template-rows: auto auto;
    grid-column-gap: 0.5rem;
    text-align: left;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    width: 100%;
  `};
`

export const CabinData1 = styled.div`
  grid-area: data1;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  `};
`

export const CabinData2 = styled.div`
  grid-area: data2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  `};
`

export const CabinTitle = styled.div`
  grid-area: title;
  padding-bottom: 0.5rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding-bottom: 0;
  `};
`

export const CabinAction = styled.div`
  grid-area: action;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
  padding-bottom: 0.5rem;
  `};
`

export const IconWrapper = styled.div`
  grid-area: icon;
  width: 100%;
  max-width: none;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 25px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0;
    margin: 0;
  `};
`

export const CabinWrapper = styled(Card)`
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
    transform: translate(0, -5px);
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.9rem;
`};
`

const InlineSection = styled.div`
  display: inline-flex;
  justify-content: center;
  width: 100%
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  justify-content: flex-start;
`};
`

interface TravelCabinCard {
  item: TravelCabinInfo
  chainDecimals: number
  token: string
}

export default function TravelCabinCard(props: TravelCabinCard) {
  const { item, chainDecimals, token } = props
  const travelCabinInfo = item
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  const bonusPercent = Math.floor(
    cdDivide(travelCabinInfo.bonus_total, travelCabinInfo.deposit_amount, chainDecimals) * 100
  )

  return (
    <CabinWrapper>
      <Link to={`/assets/travelcabin/${travelCabinInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
        <CabinCard>
          <IconWrapper>
            <div style={{ maxWidth: '25px' }}>{getCabinClassImage(travelCabinInfo.name.toString())}</div>
          </IconWrapper>
          <CabinTitle>
            <HeavyText style={{ marginLeft: '0', marginTop: '0', width: '100%' }}>
              {`${t(`TravelCabin`)}: ${travelCabinInfo.name.toString()}`}
            </HeavyText>
          </CabinTitle>
          <CabinData1>
            <InlineSection>
              <HeavyText width="fit-content">{t(`Fare`)}:</HeavyText>
              <SText width="fit-content" padding={'0 0.5rem'}>
                {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals)} {token}
              </SText>
            </InlineSection>
            {expectedBlockTime && (
              <InlineSection>
                <HeavyText width="fit-content">{t(`Trip`)}:</HeavyText>
                <SText width="fit-content" padding={'0 0.5rem'}>
                  {blockToDays(travelCabinInfo.maturity, expectedBlockTime, 2)} {t(`days`)}
                </SText>
              </InlineSection>
            )}
          </CabinData1>
          <CabinData2>
            <InlineSection>
              <HeavyText width="fit-content">{t(`APY`)}:</HeavyText>
              <SText width="fit-content" padding={'0 0.5rem'}>
                {expectedBlockTime && (
                  <>
                    {`${getApy({
                      totalYield: travelCabinInfo.yield_total.toBn(),
                      totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                      chainDecimals: chainDecimals,
                      blockTime: expectedBlockTime,
                      maturity: travelCabinInfo.maturity,
                      precision: 2,
                    })}%`}
                  </>
                )}
              </SText>
            </InlineSection>
            <InlineSection>
              <HeavyText width="fit-content">{t(`Bonus`)}:</HeavyText>
              <SText width="fit-content" padding={'0 0.5rem'}>
                {bonusPercent}%
              </SText>
            </InlineSection>
          </CabinData2>
        </CabinCard>
      </Link>
    </CabinWrapper>
  )
}
