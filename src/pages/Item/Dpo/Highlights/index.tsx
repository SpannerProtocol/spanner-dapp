import { FlatCard } from 'components/Card'
import { CircleProgress } from 'components/ProgressBar'
import { CenteredRow, RowBetween } from 'components/Row'
import { DataTokenName, HeavyText, SectionTitle, StandardText } from 'components/Text'
import { ContentWrapper, PaddedSection, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import useDpoFees from 'hooks/useDpoFees'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import { DpoIndex, DpoInfo, TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { getCabinYield } from 'utils/getCabinData'
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
  const { t } = useTranslation()
  const targetDpo = useSubDpo(targetDpoIndex)

  return (
    <>
      {targetDpo && (
        <Link to={`/item/dpo/${targetDpo.index.toString()}`} style={{ textDecoration: 'none' }}>
          <CenteredRow>
            <CenteredRow>
              <PaddedSection>
                <div style={{ display: 'block' }}>
                  <IconWrapper>
                    <Icon src={WaitingIcon} />
                  </IconWrapper>
                  <HeavyText>{`${t(`Waiting for`)} ${targetDpo.name.toString()} ${t(`to release yield`)}`}</HeavyText>
                </div>
              </PaddedSection>
            </CenteredRow>
          </CenteredRow>
        </Link>
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
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (!cabinInfo || !buyerInfo || !lastBlock || !expectedBlockTime) return
    const cabinYield = getCabinYield(cabinInfo, buyerInfo, lastBlock, chainDecimals)
    if (cabinInfo.yield_total.eq(buyerInfo.yield_withdrawn)) {
      setYieldAvailable('All yield withdrawn')
    } else {
      setYieldAvailable(cabinYield)
    }
  }, [cabinInfo, buyerInfo, lastBlock, chainDecimals, expectedBlockTime, dpoInfo])

  const token = cabinInfo && cabinInfo.token_id.isToken && cabinInfo.token_id.asToken.toString()
  return (
    <>
      {buyerInfo && cabinInfo && yieldAvailable && (
        <>
          <SpacedSection margin="2rem 0" mobileMargin="1rem 0">
            <Link
              to={`/item/travelCabin/${cabinIndex.toString()}/inventory/${inventoryIndex.toString()}`}
              style={{ textDecoration: 'none' }}
            >
              <HeavyText fontSize={'24px'} mobileFontSize={'20px'} color={theme.green1} style={{ margin: 'auto' }}>
                {`${yieldAvailable} `}
                {!(yieldAvailable === 'All yield withdrawn') && (
                  <DataTokenName color={theme.green1}>{token}</DataTokenName>
                )}
              </HeavyText>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StandardText fontSize="12px" mobileFontSize="11px" style={{ paddingRight: '0.25rem' }}>
                  {t(`Yield in`)}
                </StandardText>
                <HeavyText fontSize={'12px'} mobileFontSize="11px" color={theme.blue2}>{`${t(
                  `TravelCabin`
                )}: ${cabinInfo.name.toString()}`}</HeavyText>
              </div>
            </Link>
          </SpacedSection>
        </>
      )}
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
      {dpoInfo.target.isDpo && dpoInfo.vault_yield.isZero() && (
        <RunningHighlightsDpoTarget targetDpoIndex={dpoInfo.target.asDpo[0]} />
      )}
    </>
  )
}

function ActiveHighlightsDpoTarget({ dpoInfo, targetDpoIndex }: { dpoInfo: DpoInfo; targetDpoIndex: DpoIndex }) {
  const { t } = useTranslation()
  const targetDpo = useSubDpo(targetDpoIndex)
  const theme = useContext(ThemeContext)

  return (
    <>
      {targetDpo && (
        <>
          <SpacedSection margin="2rem 0" mobileMargin="1rem 0">
            <Link to={`/item/dpo/${targetDpo.index.toString()}`} style={{ textDecoration: 'none' }}>
              <CenteredRow>
                <div style={{ display: 'block' }}>
                  {targetDpo.state.isCreated && !dpoInfo.vault_deposit.isZero() && (
                    <>
                      <HeavyText width="100%">{`${t(`DPO Filled! You can now buy seats from`)}`}</HeavyText>
                      <HeavyText color={theme.blue2} width="100%">
                        {targetDpo.name.toString()}
                      </HeavyText>
                    </>
                  )}
                  {targetDpo.state.isCreated && dpoInfo.vault_deposit.isZero() && (
                    <>
                      <IconWrapper>
                        <Icon src={WaitingIcon} />
                      </IconWrapper>
                      <div style={{ display: 'flex' }}>
                        <HeavyText>{t(`Waiting for`)}</HeavyText>
                        <HeavyText
                          color={theme.blue2}
                          padding="0 0.25rem"
                        >{` ${targetDpo.name.toString()} `}</HeavyText>
                        <HeavyText>{t(`to finish crowdfunding`)}</HeavyText>
                      </div>
                    </>
                  )}
                  {targetDpo.state.isActive && (
                    <>
                      <IconWrapper>
                        <Icon src={WaitingIcon} />
                      </IconWrapper>
                      <div style={{ display: 'flex' }}>
                        <HeavyText>{t(`Waiting for`)}</HeavyText>
                        <HeavyText
                          color={theme.blue2}
                          padding="0 0.25rem"
                        >{` ${targetDpo.name.toString()} `}</HeavyText>
                        <HeavyText>{t(`to purchase target`)}</HeavyText>
                      </div>
                    </>
                  )}
                  {targetDpo.state.isRunning && (
                    <>
                      <IconWrapper>
                        <Icon src={WaitingIcon} />
                      </IconWrapper>
                      <div style={{ display: 'flex' }}>
                        <HeavyText>{t(`Waiting for`)}</HeavyText>
                        <HeavyText
                          color={theme.blue2}
                          padding="0 0.25rem"
                        >{` ${targetDpo.name.toString()} `}</HeavyText>
                        <HeavyText>{t(`to release yield`)}</HeavyText>
                      </div>
                    </>
                  )}
                </div>
              </CenteredRow>
            </Link>
          </SpacedSection>
        </>
      )}
    </>
  )
}

function ActiveHighlights({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return <ActiveHighlightsDpoTarget dpoInfo={dpoInfo} targetDpoIndex={dpoInfo.target.asDpo[0]} />
}

function CreateHighlights({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const progress = 100 - dpoInfo.empty_seats.toNumber()
  const below420 = useMedia('(max-width: 420px)')
  const { chainDecimals } = useSubstrate()
  const token = dpoInfo.token_id.asToken.toString()
  const { t } = useTranslation()
  const fees = useDpoFees(dpoInfo.index.toString())

  return (
    <>
      <RowBetween>
        <PaddedSection>
          <CircleProgress value={progress} size={below420 ? 60 : 100} />
        </PaddedSection>
        {fees && (
          <PaddedSection>
            <HeavyText fontSize="24px" mobileFontSize="18px" style={{ margin: 'auto' }}>
              {dpoInfo.fee.toNumber() / 10}%
            </HeavyText>
            <StandardText fontSize="9px" style={{ margin: 'auto' }}>
              {`${fees.base} ${t(`Base`)} + ${fees.management} ${t(`Seats`)}`}
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
      {(dpoInfo.state.isCreated || dpoInfo.state.isActive || dpoInfo.state.isRunning) &&
        !(dpoInfo.state.isActive && dpoInfo.target.isTravelCabin) && (
          <ContentWrapper>
            <FlatCard>
              <SectionTitle>{t(`Highlights`)}</SectionTitle>
              {dpoInfo.state.isCreated && <CreateHighlights dpoInfo={dpoInfo} />}
              {dpoInfo.state.isActive && dpoInfo.target.isDpo && <ActiveHighlights dpoInfo={dpoInfo} />}
              {dpoInfo.state.isRunning && <RunningHighlights dpoInfo={dpoInfo} />}
            </FlatCard>
          </ContentWrapper>
        )}
    </>
  )
}
