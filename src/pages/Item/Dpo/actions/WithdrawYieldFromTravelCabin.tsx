import Balance from 'components/Balance'
import { StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import Action from 'pages/Item/actions'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { getTreasureHuntingGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function WithdrawYieldFromTravelCabin({
  dpoInfo,
  dpoAction,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const targetCabin = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const inventoryIndex = useDpoTravelCabinInventoryIndex(dpoInfo.index.toString(), targetCabin?.index.toString())
  const buyerInfo = useSubTravelCabinBuyer(targetCabin?.index, inventoryIndex)
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [treasureHuntingGp, setTreasureHuntingGp] = useState<string>()

  // Release Yield Grace Period
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock || !buyerInfo) return
    const gp = getTreasureHuntingGpLeft(buyerInfo, lastBlock, expectedBlockTime)
    if (gp) setTreasureHuntingGp(gp)
  }, [buyerInfo, expectedBlockTime, lastBlock])

  return (
    <Action
      txContent={
        <>
          <StandardText>{t(`Withdraw Yield from Cabin`)}</StandardText>
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Withdraw Yield from Cabin')}
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
      transaction={{
        section: 'bulletTrain',
        method: 'withdrawYieldFromTravelCabin',
        params: {
          travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
          travelCabinNumber: inventoryIndex,
        },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
