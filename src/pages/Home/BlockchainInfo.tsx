import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { Header2, Header4, HeavyText } from '../../components/Text'
import { useBlockManager } from '../../hooks/useBlocks'
import { useSubstrate } from '../../hooks/useSubstrate'

export function Blockchain() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const constants = useSubstrate()
  const { chain } = constants
  const { t } = useTranslation()

  return (
    <FlatCard style={{ textAlign: 'left', paddingBottom: '2rem' }}>
      <Header2>{t(`Blockchain Info`)}</Header2>
      <RowBetween>
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {t(`Connected to`)}
        </HeavyText>
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {chain}
        </HeavyText>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween>
          <HeavyText fontSize="18px" mobileFontSize="14px">
            {t(`Estimated Time per Block`)}
          </HeavyText>
          <HeavyText fontSize="18px" mobileFontSize="14px">
            {`${expectedBlockTime.toNumber() / 1000} ${t(`seconds`)}`}
          </HeavyText>
        </RowBetween>
      )}
      {lastBlock && (
        <>
          <div style={{ textAlign: 'center', margin: 'auto', padding: '1rem 0' }}>
            <Header4>{t(`# of Blocks Finalized`)}</Header4>
          </div>
          <HeavyText fontSize="30px" mobileFontSize="24px" colorIsPrimary width="100%" textAlign="center">
            {lastBlock.toString()}
          </HeavyText>
        </>
      )}
    </FlatCard>
  )
}
