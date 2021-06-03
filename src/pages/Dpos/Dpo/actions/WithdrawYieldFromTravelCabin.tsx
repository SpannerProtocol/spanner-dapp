import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Assets/actions'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { ThemeContext } from 'styled-components'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { getCabinYield, getTreasureHuntingGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function WithdrawYieldFromTravelCabin({
  dpoInfo,
  dpoAction,
  isLast,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const targetCabin = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const inventoryIndex = useDpoTravelCabinInventoryIndex(dpoInfo.index.toString(), targetCabin?.index.toString())
  const buyerInfo = useSubTravelCabinBuyer(targetCabin?.index, inventoryIndex)
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [treasureHuntingGp, setTreasureHuntingGp] = useState<string>()
  const { chainDecimals } = useSubstrate()
  const [yieldAvailable, setYieldAvailable] = useState<string>()
  const theme = useContext(ThemeContext)

  // Release Yield Grace Period
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock || !buyerInfo) return
    const gp = getTreasureHuntingGpLeft(buyerInfo, lastBlock, expectedBlockTime)
    if (gp) setTreasureHuntingGp(gp)
  }, [buyerInfo, expectedBlockTime, lastBlock])

  // Yield in cabin
  useEffect(() => {
    if (!targetCabin || !buyerInfo || !lastBlock || !expectedBlockTime) return
    const cabinYield = getCabinYield(targetCabin, buyerInfo, lastBlock, chainDecimals)
    if (targetCabin.yield_total.eq(buyerInfo.yield_withdrawn)) {
      setYieldAvailable('All yield withdrawn')
    } else {
      setYieldAvailable(cabinYield)
    }
  }, [targetCabin, buyerInfo, lastBlock, chainDecimals, expectedBlockTime, dpoInfo])

  return (
    <Action
      actionName={t('Withdraw Yield from Cabin')}
      actionDesc={
        <RowFixed>
          <SText width="fit-content" fontSize="10px" mobileFontSize="10px" style={{ paddingRight: '0.25rem' }}>
            {t(`Yield`)}:
          </SText>
          <HeavyText width="fit-content" mobileFontSize="10px" color={theme.green1}>
            {`${yieldAvailable} `}
            {!(yieldAvailable === 'All yield withdrawn') && (
              <TokenText color={theme.green1}>{dpoInfo.token_id.asToken.toString()}</TokenText>
            )}
          </HeavyText>
        </RowFixed>
      }
      tip={t(`Withdraw accumulated Yield from TravelCabin to DPO vault.`)}
      buttonText={t('Withdraw')}
      icon={ACTION_ICONS[dpoAction.action]}
      gracePeriod={
        treasureHuntingGp && lastBlock && expectedBlockTime
          ? {
              timeLeft: blocksToCountDown(treasureHuntingGp, expectedBlockTime, t(`Time's up!`)),
              tip: t(
                `Treasure Hunting Rule: If manager does not withdraw yield from Cabin before this grace period, the user who withdraws it will receive 1% of the unwithdrawn yield.`
              ),
              alert:
                parseInt(treasureHuntingGp) <= 0
                  ? 'danger'
                  : parseInt(blockToHours(treasureHuntingGp, expectedBlockTime, 0)) <= 24
                  ? 'warning'
                  : 'safe',
            }
          : undefined
      }
      txContent={
        <>
          {targetCabin && (
            <SpacedSection>
              <SText>{`${t(`Withdraw Yield from Cabin`)}: ${targetCabin.name.toString()}`}</SText>
            </SpacedSection>
          )}
          <Divider />
          {yieldAvailable && (
            <SpacedSection>
              <RowBetween>
                <SText width="fit-content">{t(`Yield`)}</SText>
                <SText width="fit-content">
                  {yieldAvailable} {dpoInfo.token_id.asToken.toString()}
                </SText>
              </RowBetween>
            </SpacedSection>
          )}
          <Divider />
          <SpacedSection>
            <Balance token={dpoInfo.token_id.asToken.toString()} />
            <TxFee fee={estimatedFee} />
          </SpacedSection>
        </>
      }
      transaction={{
        section: 'bulletTrain',
        method: 'withdrawYieldFromTravelCabin',
        params: {
          travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
          travelCabinNumber: inventoryIndex,
        },
      }}
      setEstimatedFee={setEstimatedFee}
      isLast={isLast}
    />
  )
}
