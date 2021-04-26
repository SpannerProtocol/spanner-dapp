import { FlatCard } from 'components/Card'
import { CircleProgress } from 'components/ProgressBar'
import { RowBetween } from 'components/Row'
import { DataTokenName, HeavyText, SectionTitle, StandardText } from 'components/Text'
import { ContentWrapper, PaddedSection, Section } from 'components/Wrapper'
import { useDpoManager } from 'hooks/useQueryDpoMembers'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMedia } from 'react-use'
import { DpoInfo } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'

function CreateHighlights({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const manager = useDpoManager(dpoInfo.index, dpoInfo)
  const progress = 100 - dpoInfo.empty_seats.toNumber()
  const below420 = useMedia('(max-width: 420px)')
  const { chainDecimals } = useSubstrate()
  const token = dpoInfo.token_id.asToken.toString()
  const { t } = useTranslation()

  return (
    <>
      <RowBetween>
        <PaddedSection>
          <CircleProgress value={progress} size={below420 ? 60 : 100} />
        </PaddedSection>
        {manager && (
          <PaddedSection>
            <HeavyText fontSize="24px" mobileFontSize="18px" style={{ margin: 'auto' }}>
              {dpoInfo.fee.toNumber() / 10}%
            </HeavyText>
            <StandardText fontSize="9px" style={{ margin: 'auto' }}>
              {`${dpoInfo.fee.toNumber() / 10 - manager.number_of_seats.toNumber()} ${t(
                `Base`
              )} + ${manager.number_of_seats.toNumber()} ${t(`Seats`)}`}
            </StandardText>
            <StandardText style={{ margin: 'auto' }}>{t(`Management Fee`)}</StandardText>
          </PaddedSection>
        )}
        <PaddedSection>
          <HeavyText fontSize="24px" mobileFontSize="18px" style={{ margin: 'auto' }}>
            {`${formatToUnit(dpoInfo.amount_per_seat.toString(), chainDecimals)} `}
            <DataTokenName>{token}</DataTokenName>
          </HeavyText>
          <StandardText style={{ margin: 'auto' }}>{t(`Cost per Seat`)}</StandardText>
        </PaddedSection>
      </RowBetween>
    </>
  )
}

interface HighlightsProps {
  dpoInfo: DpoInfo
}

export default function Highlights({ dpoInfo }: HighlightsProps) {
  const { t } = useTranslation()
  return (
    <ContentWrapper>
      <FlatCard>
        <Section>
          <SectionTitle>{t(`Highlights`)}</SectionTitle>
        </Section>
        {dpoInfo.state.isCreated && <CreateHighlights dpoInfo={dpoInfo} />}
      </FlatCard>
    </ContentWrapper>
  )
}
