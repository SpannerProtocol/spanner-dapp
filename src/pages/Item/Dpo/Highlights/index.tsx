import { FlatCard } from 'components/Card'
import { CircleProgress } from 'components/ProgressBar'
import { RowBetween } from 'components/Row'
import { DataTokenName, HeavyText, SectionTitle, StandardText } from 'components/Text'
import { ContentWrapper, GridWrapper, PaddedSection, Section } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoManager } from 'hooks/useQueryDpoMembers'
import { useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMedia } from 'react-use'
import { DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { ThemeContext } from 'styled-components'
import { blockToDays } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { getCabinGracePeriodTimeLeft, getCabinYield } from 'utils/getCabinData'
import { getDpoCabinInventoryIndex } from 'utils/getTravelCabinBuyer'

function RunningHighlightsCabinTarget({
  cabinIndex,
  inventoryIndex,
}: {
  dpoInfo: DpoInfo
  cabinIndex: TravelCabinIndex
  inventoryIndex: TravelCabinInventoryIndex
}) {
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()
  const cabinInfo = useSubTravelCabin(cabinIndex)
  const buyerInfo = useSubTravelCabinBuyer(cabinIndex, inventoryIndex)
  const [yieldAvailable, setYieldAvailable] = useState<string>()
  const [graceTimeLeft, setGraceTimeLeft] = useState<string>()
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock || !expectedBlockTime) return
    setYieldAvailable(getCabinYield(cabinInfo, buyerInfo, lastBlock, chainDecimals))
    setGraceTimeLeft(getCabinGracePeriodTimeLeft(buyerInfo, lastBlock, expectedBlockTime))
  }, [cabinInfo, buyerInfo, lastBlock, chainDecimals, expectedBlockTime])

  const token = cabinInfo && cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.toString()
  console.log()
  return (
    <>
      <GridWrapper columns={'2'} mobileColumns={'2'}>
        {buyerInfo && cabinInfo && yieldAvailable && (
          <PaddedSection>
            <HeavyText fontSize={'14px'} color={theme.green1} style={{ margin: 'auto' }}>
              {`${yieldAvailable} / 
            ${formatToUnit(cabinInfo.yield_total.sub(buyerInfo.yield_withdrawn), chainDecimals)} ${token}`}
            </HeavyText>
            <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
              {t(`Yield Available`)}
            </StandardText>
          </PaddedSection>
        )}
        {graceTimeLeft && expectedBlockTime && (
          <PaddedSection>
            <div style={{ display: 'block' }}>
              <HeavyText fontSize={'14px'} style={{ margin: 'auto' }}>
                {`${graceTimeLeft} blocks`}
              </HeavyText>
              <HeavyText fontSize={'14px'} style={{ margin: 'auto' }}>
                {blockToDays(graceTimeLeft, expectedBlockTime, 2)} {t(`days`)}
              </HeavyText>
            </div>
            <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
              {t(`Grace Period`)}
            </StandardText>
          </PaddedSection>
        )}
      </GridWrapper>
    </>
  )
}

function RunningHighlights({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { api, connected } = useApi()
  const [inventoryIndexes, setInventoryIndexes] = useState<[TravelCabinIndex, TravelCabinInventoryIndex]>()

  useEffect(() => {
    if (!connected) return
    getDpoCabinInventoryIndex(api, dpoInfo).then((inventory) => {
      if (!inventory) return
      setInventoryIndexes(inventory)
    })
  }, [api, connected, dpoInfo])

  return (
    <>
      {inventoryIndexes && dpoInfo.target.isTravelCabin && (
        <RunningHighlightsCabinTarget
          dpoInfo={dpoInfo}
          cabinIndex={inventoryIndexes[0]}
          inventoryIndex={inventoryIndexes[1]}
        />
      )}
    </>
  )
}

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
    <>
      {(dpoInfo.state.isCreated || dpoInfo.state.isRunning) && (
        <ContentWrapper>
          <FlatCard>
            <Section>
              <SectionTitle>{t(`Highlights`)}</SectionTitle>
            </Section>
            {dpoInfo.state.isCreated && <CreateHighlights dpoInfo={dpoInfo} />}
            {dpoInfo.state.isRunning && <RunningHighlights dpoInfo={dpoInfo} />}
          </FlatCard>
        </ContentWrapper>
      )}
    </>
  )
}
