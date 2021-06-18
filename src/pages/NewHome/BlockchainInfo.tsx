import { useBlockManager } from '../../hooks/useBlocks'
import { useSubstrate } from '../../hooks/useSubstrate'
import { useTranslation } from 'react-i18next'
import { FlatCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { Header4 } from '../../components/Text'
import React from 'react'
import { HomeSectionLabel2, HomeSectionTitle, HomeSectionValue4, HomeSectionValue5 } from './index'

export function Blockchain() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const constants = useSubstrate()
  const { chain } = constants
  const { t } = useTranslation()

  return (
    <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
      <HomeSectionTitle>{t(`Blockchain Info`)}</HomeSectionTitle>
      <RowBetween>
        <HomeSectionLabel2>{t(`Connected to`)}</HomeSectionLabel2>
        <HomeSectionValue4>{chain}</HomeSectionValue4>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween>
          <HomeSectionLabel2>{t(`Estimated Time per Block`)}</HomeSectionLabel2>
          <HomeSectionValue4>{`${expectedBlockTime.toNumber() / 1000} ${t(`seconds`)}`}</HomeSectionValue4>
        </RowBetween>
      )}
      {lastBlock && (
        <>
          <div style={{ textAlign: 'center', margin: 'auto', padding: '1rem 0' }}>
            <Header4>{t(`# of Blocks Finalized`)}</Header4>
          </div>
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <HomeSectionValue5>{lastBlock.toString()}</HomeSectionValue5>
          </div>
        </>
      )}
    </FlatCard>
  )
}
