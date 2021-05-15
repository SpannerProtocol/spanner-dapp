import { BN_ZERO } from '@polkadot/util'
import { FlatCard } from 'components/Card'
import { CircleProgress } from 'components/ProgressBar'
import { CenteredRow, RowBetween } from 'components/Row'
import { DataTokenName, HeavyText, SectionTitle, StandardText } from 'components/Text'
import { BorderedWrapper, ContentWrapper, GridWrapper, PaddedSection, Section } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoManager } from 'hooks/useQueryDpoMembers'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import { DpoIndex, DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import { blockToDays, daysToBlocks } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { getCabinYield, getTreasureHuntingGPLeft, getYieldGPLeft } from 'utils/getCabinData'
import { getDpoCabinInventoryIndex } from 'utils/getTravelCabinBuyer'
import WaitingIcon from '../../../../assets/svg/icon-waiting.svg'

const Icon = styled.img`
  max-height: 100%;
`

const IconWrapper = styled.div`
  grid-area: icon;
  padding: 0.5rem;
  height: 70px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
  height: 40px;
`};
`

function RunningHighlightsDpoTarget({ targetDpoIndex }: { targetDpoIndex: DpoIndex }) {
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()
  const dpoInfo = useSubDpo(targetDpoIndex)
  const theme = useContext(ThemeContext)

  let gracePeriodTimeLeft = BN_ZERO
  if (dpoInfo && expectedBlockTime && lastBlock) {
    gracePeriodTimeLeft = dpoInfo.blk_of_last_yield
      .unwrapOr(gracePeriodTimeLeft)
      .add(daysToBlocks(7, expectedBlockTime))
      .sub(lastBlock)
    if (gracePeriodTimeLeft.lte(BN_ZERO)) {
      gracePeriodTimeLeft = BN_ZERO
    }
  }

  return (
    <>
      {dpoInfo && (
        <>
          {dpoInfo.vault_yield.isZero() ? (
            <Link to={`/item/dpo/${dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
              <CenteredRow>
                <CenteredRow>
                  <PaddedSection>
                    <div style={{ display: 'block' }}>
                      <IconWrapper>
                        <Icon src={WaitingIcon} />
                      </IconWrapper>
                      <HeavyText>{`${t(`Waiting for`)} ${dpoInfo.name.toString()} ${t(
                        `to receive and release yield`
                      )}`}</HeavyText>
                    </div>
                  </PaddedSection>
                </CenteredRow>
              </CenteredRow>
            </Link>
          ) : (
            <>
              <GridWrapper columns={'2'} mobileColumns={'2'}>
                {dpoInfo.vault_yield.isZero() && (
                  <PaddedSection>
                    <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                      <HeavyText fontSize={'12px'} color={theme.text3} style={{ margin: 'auto' }}>
                        {t(`Waiting for`)} {dpoInfo.name} {t(`to release yield`)}
                      </HeavyText>
                    </div>
                  </PaddedSection>
                )}
                {!dpoInfo.vault_yield.isZero() && (
                  <PaddedSection>
                    <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                      <HeavyText fontSize={'12px'} color={theme.text3} style={{ margin: 'auto' }}>
                        {t(`Waiting for`)} {dpoInfo.name} {t(`to withdraw yield`)}
                      </HeavyText>
                    </div>
                  </PaddedSection>
                )}
                {gracePeriodTimeLeft && expectedBlockTime && (
                  <PaddedSection>
                    <HeavyText fontSize={'24px'} mobileFontSize={'20px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${formatToUnit(gracePeriodTimeLeft.toString(), 0)} `}
                      <DataTokenName>{t(`Blocks`)}</DataTokenName>
                    </HeavyText>
                    <HeavyText fontSize={'14px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${blockToDays(gracePeriodTimeLeft, expectedBlockTime, 2)} `}
                      <DataTokenName fontSize={'12px'} mobileFontSize="8px">{`${t(`Days`)}`}</DataTokenName>
                    </HeavyText>
                    <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
                      {t(`Grace Period`)}
                    </StandardText>
                  </PaddedSection>
                )}
              </GridWrapper>
              <PaddedSection style={{ paddingTop: '0' }}>
                <CenteredRow>
                  <Link to={`/item/dpo/${dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'block ' }}>
                      <StandardText style={{ margin: 'auto' }}>{t(`Yield in`)}:</StandardText>
                      <HeavyText fontSize={'18px'} color={theme.blue2} mobileFontSize={'14px'}>
                        {`${t(`DPO`)}: ${dpoInfo.name.toString()}`}
                      </HeavyText>
                    </div>
                  </Link>
                </CenteredRow>
              </PaddedSection>
            </>
          )}
        </>
      )}
    </>
  )
}

function RunningHighlightsCabinTarget({
  cabinIndex,
  inventoryIndex,
  dpoInfo,
}: {
  cabinIndex: TravelCabinIndex
  inventoryIndex: TravelCabinInventoryIndex
  dpoInfo: DpoInfo
}) {
  const { chainDecimals } = useSubstrate()
  const { lastBlock } = useBlockManager()
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()
  const cabinInfo = useSubTravelCabin(cabinIndex)
  const buyerInfo = useSubTravelCabinBuyer(cabinIndex, inventoryIndex)
  const [yieldAvailable, setYieldAvailable] = useState<string>()
  const [treasureHuntingGPLeft, setTreasureHuntingGPLeft] = useState<string>()
  const [yieldGPLeft, setYieldGPLeft] = useState<string>()
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock || !expectedBlockTime) return
    setYieldAvailable(getCabinYield(cabinInfo, buyerInfo, lastBlock, chainDecimals))
    setTreasureHuntingGPLeft(getTreasureHuntingGPLeft(buyerInfo, lastBlock, expectedBlockTime))
    const yieldGP = getYieldGPLeft(dpoInfo, lastBlock, expectedBlockTime)
    setYieldGPLeft(yieldGP ? yieldGP : undefined)
  }, [cabinInfo, buyerInfo, lastBlock, chainDecimals, expectedBlockTime, dpoInfo])

  const token = cabinInfo && cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.toString()
  return (
    <>
      <GridWrapper columns={'1'} mobileColumns={'1'}>
        {buyerInfo && cabinInfo && yieldAvailable && (
          <>
            <Link
              to={`/item/travelCabin/${cabinIndex.toString()}/inventory/${inventoryIndex.toString()}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ display: 'flex' }}>
                <StandardText fontSize="12px" mobileFontSize="11px" style={{ paddingRight: '0.25rem' }}>
                  {t(`Yield in`)}
                </StandardText>
                <HeavyText fontSize={'12px'} mobileFontSize="11px" color={theme.blue2}>{`${t(
                  `TravelCabin`
                )}: ${cabinInfo.name.toString()}`}</HeavyText>
              </div>
            </Link>
            <BorderedWrapper marginBottom="0" marginTop="0">
              <HeavyText fontSize={'24px'} mobileFontSize={'20px'} color={theme.green1} style={{ margin: 'auto' }}>
                {`${yieldAvailable} `}
                <DataTokenName color={theme.green1}>{token}</DataTokenName>
              </HeavyText>
              <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
                {t(`Yield Available`)}
              </StandardText>
            </BorderedWrapper>
          </>
        )}
        <>
          <StandardText fontSize="12px" mobileFontSize="11px">
            {t(`Grace Period`)}
          </StandardText>
          <BorderedWrapper marginTop="0" marginBottom="0" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              {treasureHuntingGPLeft && expectedBlockTime && (
                <>
                  <div style={{ display: 'block', paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <HeavyText fontSize={'24px'} mobileFontSize={'20px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${formatToUnit(treasureHuntingGPLeft, 0)} `}
                      <DataTokenName>{t(`Blocks`)}</DataTokenName>
                    </HeavyText>
                    <HeavyText fontSize={'14px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${blockToDays(treasureHuntingGPLeft, expectedBlockTime, 4)} `}
                      <DataTokenName>{t(`Days`)}</DataTokenName>
                    </HeavyText>
                    <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
                      {t(`Time left to Withdraw Yield`)}
                    </StandardText>
                  </div>
                </>
              )}
              {yieldGPLeft && expectedBlockTime && (
                <>
                  <div style={{ display: 'block', paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <HeavyText fontSize={'24px'} mobileFontSize={'20px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${formatToUnit(yieldGPLeft, 0)} `}
                      <DataTokenName>{t(`Blocks`)}</DataTokenName>
                    </HeavyText>
                    <HeavyText fontSize={'14px'} color={theme.text3} style={{ margin: 'auto' }}>
                      {`${blockToDays(yieldGPLeft, expectedBlockTime, 4)} `}
                      <DataTokenName>{t(`Days`)}</DataTokenName>
                    </HeavyText>
                    <StandardText fontSize={'12px'} style={{ margin: 'auto' }}>
                      {t(`Time left to Release Yield`)}
                    </StandardText>
                  </div>
                </>
              )}
            </div>
          </BorderedWrapper>
        </>
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
      {dpoInfo.target.isTravelCabin && inventoryIndexes && (
        <RunningHighlightsCabinTarget
          cabinIndex={inventoryIndexes[0]}
          inventoryIndex={inventoryIndexes[1]}
          dpoInfo={dpoInfo}
        />
      )}
      {dpoInfo.target.isDpo && <RunningHighlightsDpoTarget targetDpoIndex={dpoInfo.target.asDpo[0]} />}
    </>
  )
}

function ActiveHighlightsDpoTarget({ targetDpoIndex }: { targetDpoIndex: DpoIndex }) {
  const { t } = useTranslation()
  const dpoInfo = useSubDpo(targetDpoIndex)
  return (
    <>
      {dpoInfo && (
        <>
          <Link to={`/item/dpo/${dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
            <CenteredRow>
              <PaddedSection>
                <div style={{ display: 'block' }}>
                  <IconWrapper>
                    <Icon src={WaitingIcon} />
                  </IconWrapper>
                  <HeavyText>{`${t(`Waiting for`)} ${dpoInfo.name.toString()} ${t(`to release yield`)}`}</HeavyText>
                </div>
              </PaddedSection>
            </CenteredRow>
          </Link>
        </>
      )}
    </>
  )
}

function ActiveHighlights({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return <>{dpoInfo.target.isDpo && <ActiveHighlightsDpoTarget targetDpoIndex={dpoInfo.target.asDpo[0]} />}</>
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
      {(dpoInfo.state.isCreated || dpoInfo.state.isActive || dpoInfo.state.isRunning) && (
        <ContentWrapper>
          <FlatCard>
            <Section>
              <SectionTitle>{t(`Highlights`)}</SectionTitle>
            </Section>
            {dpoInfo.state.isCreated && <CreateHighlights dpoInfo={dpoInfo} />}
            {dpoInfo.state.isActive && <ActiveHighlights dpoInfo={dpoInfo} />}
            {dpoInfo.state.isRunning && <RunningHighlights dpoInfo={dpoInfo} />}
          </FlatCard>
        </ContentWrapper>
      )}
    </>
  )
}
