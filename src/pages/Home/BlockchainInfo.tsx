import { CenterWrapper } from 'components/Wrapper'
import { useTranslation } from 'react-i18next'
import Card from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { Header2, Header4, HeavyText } from '../../components/Text'
import { useBlockManager } from '../../hooks/useBlocks'
import { useSubstrate } from '../../hooks/useSubstrate'

export function Blockchain() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const { chain } = useSubstrate()
  const { t } = useTranslation()

  return (
    <Card>
      <Header2>{t(`Blockchain Info`)}</Header2>
      <RowBetween padding="0.5rem 0">
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {t(`Connected to`)}
        </HeavyText>
        <HeavyText fontSize="18px" mobileFontSize="14px">
          {chain}
        </HeavyText>
      </RowBetween>
      {expectedBlockTime && (
        <RowBetween padding="0.5rem 0">
          <HeavyText fontSize="18px" mobileFontSize="14px">
            {t(`Estimated Time per Block`)}
          </HeavyText>
          <HeavyText fontSize="18px" mobileFontSize="14px">
            {`${expectedBlockTime.toNumber() / 1000} ${t(`seconds`)}`}
          </HeavyText>
        </RowBetween>
      )}
      {lastBlock && (
        <CenterWrapper>
          <div style={{ display: 'block', padding: '1rem 0' }}>
            <Header4>{t(`# of Blocks Finalized`)}</Header4>
            <HeavyText fontSize="30px" mobileFontSize="24px" colorIsPrimary width="100%" textAlign="center">
              {lastBlock.toString()}
            </HeavyText>
          </div>
        </CenterWrapper>
      )}
    </Card>
  )
}
