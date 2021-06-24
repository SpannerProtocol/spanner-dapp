import { RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import useStats from 'hooks/useStats'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'

export default function BulletTrainStats({ token }: { token: string }) {
  const stats = useStats(token)
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  return (
    <>
      <RowFixed>
        <HeavyText color="#fff">{t(`Total Deposits Stored`)}:</HeavyText>
        <RowFixed width="fit-content">
          <SText padding="0 0 0 0.5rem" colorIsPrimary>
            {formatToUnit(stats.totalValueLocked, chainDecimals)}
          </SText>
          <TokenText padding="0 0.25rem">{token}</TokenText>
        </RowFixed>
      </RowFixed>
      <RowFixed>
        <HeavyText color="#fff">{t(`Yield Distributed`)}:</HeavyText>
        <RowFixed width="fit-content">
          <SText padding="0 0 0 0.5rem" colorIsPrimary>
            {formatToUnit(stats.totalYieldWithdrawn, chainDecimals)}
          </SText>
          <TokenText padding="0 0.25rem">{token}</TokenText>
        </RowFixed>
      </RowFixed>
      <RowFixed>
        <HeavyText color="#fff">{t(`Cabins Purchased`)}:</HeavyText>
        <SText padding="0 0 0 0.5rem" colorIsPrimary>
          {stats.totalCabinsBought}
        </SText>
      </RowFixed>
      <RowFixed>
        <HeavyText color="#fff">{t(`Users Participating`)}:</HeavyText>
        <SText padding="0 0 0 0.5rem" colorIsPrimary>
          {stats.totalPassengers}
        </SText>
      </RowFixed>
    </>
  )
}
