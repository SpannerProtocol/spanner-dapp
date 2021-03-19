import { ThinShadowCard } from 'components/Card'
import { DataTokenName } from 'components/Text'
import useStats from 'hooks/useStats'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToHumanFromUnit } from 'utils/formatUnit'

const StatValue = styled.div`
  font-size: 30px;
  font-weight: 700;
  color: #fff;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
`};
`

const StatText = styled.div`
  color: #000;
`

const StatDisplayContainer = styled.div`
  margin-bottom: 1rem;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 4fr));
  grid-template-rows: repeat(2, minmax(0, 4fr));
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  width: 100%;
  `};
`

export default function BulletTrainStats() {
  const stats = useStats()
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const background = 'linear-gradient(90deg, #FFBE2E -11.67%, #FF9E04 100%)'
  return (
    <StatDisplayContainer>
      <StatDisplay>
        {stats.totalCabinsBought && (
          <ThinShadowCard background={background}>
            <StatValue>{stats.totalCabinsBought}</StatValue>
            <StatText>{t(`Cabins Purchased`)}</StatText>
          </ThinShadowCard>
        )}
        {stats.totalPassengers && (
          <ThinShadowCard background={background}>
            <StatValue>{stats.totalPassengers}</StatValue>
            <StatText>{t(`Passengers Aboard`)}</StatText>
          </ThinShadowCard>
        )}
        {stats.totalYieldWithdrawn && (
          <ThinShadowCard background={background}>
            <StatValue>
              {formatToHumanFromUnit(stats.totalYieldWithdrawn, chainDecimals, 0)}{' '}
              <DataTokenName color="white">BOLT</DataTokenName>
            </StatValue>
            <StatText>{t(`Yield Distributed`)}</StatText>
          </ThinShadowCard>
        )}
        {stats.totalValueLocked && (
          <ThinShadowCard background={background}>
            <StatValue>
              {formatToHumanFromUnit(stats.totalValueLocked, chainDecimals, 0)}{' '}
              <DataTokenName color="white">BOLT</DataTokenName>
            </StatValue>
            <StatText>{t(`Ticket Fares Stored`)}</StatText>
          </ThinShadowCard>
        )}
      </StatDisplay>
    </StatDisplayContainer>
  )
}
