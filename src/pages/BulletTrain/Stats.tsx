import { ThinShadowCard } from 'components/Card'
import { DataTokenName } from 'components/Text'
import useStats from 'hooks/useStats'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #fff;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  `};
`

const StatText = styled.div`
  color: #000;
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 11px;
    font-weight: 400;
`};
`

const StatDisplayContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const StatDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 4fr));
  grid-template-rows: repeat(2, minmax(0, 4fr));
  grid-column-gap: 10px;
  grid-row-gap: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 4fr));
    grid-template-rows: repeat(2, minmax(0, 4fr));
    grid-column-gap: 5px;
    grid-row-gap: 5px;
    width: 100%;
  `};
`

// const StatDisplaySmall = styled.div`
//   display: flex;
//   width: 100%;
// `

export default function BulletTrainStats({ token, small }: { token: string, small?: boolean }) {
  const stats = useStats(token)
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const background = 'linear-gradient(90deg, #FFBE2E -11.67%, #EC3D3D 100%)'
  return (
    <StatDisplayContainer>
      <StatDisplay>
        <ThinShadowCard background={background}>
          <StatValue>{stats.totalCabinsBought}</StatValue>
          <StatText>{t(`Cabins Purchased`)}</StatText>
        </ThinShadowCard>
        <ThinShadowCard background={background}>
          <StatValue>{stats.totalPassengers}</StatValue>
          <StatText>{t(`Passengers Aboard`)}</StatText>
        </ThinShadowCard>
        <ThinShadowCard background={background}>
          <StatValue>
            {formatToUnit(stats.totalYieldWithdrawn, chainDecimals, 0, true)}{' '}
            <DataTokenName color="white">{token}</DataTokenName>
          </StatValue>
          <StatText>{t(`Yield Distributed`)}</StatText>
        </ThinShadowCard>
        <ThinShadowCard background={background}>
          <StatValue>
            {formatToUnit(stats.totalValueLocked, chainDecimals, 0, true)}{' '}
            <DataTokenName color="white">{token}</DataTokenName>
          </StatValue>
          <StatText>{t(`Ticket Fares Stored`)}</StatText>
        </ThinShadowCard>
      </StatDisplay>
    </StatDisplayContainer>
  )
}
