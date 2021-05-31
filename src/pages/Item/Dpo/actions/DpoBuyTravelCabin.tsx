import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import Action from 'pages/Item/actions'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { getLifeSentenceGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function DpoBuyTravelCabinAvailable({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const targetCabin = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [lifeSentenceGp, setLifeSentenceGp] = useState<string>()

  // Grace Period life sentence
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock) return
    const gp = getLifeSentenceGpLeft(dpoInfo, lastBlock, expectedBlockTime)
    if (gp) setLifeSentenceGp(gp)
  }, [dpoInfo, expectedBlockTime, lastBlock])

  return (
    <Action
      txContent={
        <>
          <SpacedSection>
            <SText>{t(`Confirm purchase of TravelCabin.`)}</SText>
          </SpacedSection>
          {targetCabin && (
            <BorderedWrapper>
              <RowBetween>
                <SText>{t(`Travel Class`)}</SText>
                <SText>{targetCabin.name.toString()}</SText>
              </RowBetween>
            </BorderedWrapper>
          )}
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Buy TravelCabin')}
      buttonText={t('Buy')}
      icon={ACTION_ICONS[dpoAction.action]}
      gracePeriod={
        lifeSentenceGp && lastBlock && expectedBlockTime
          ? {
              timeLeft: blocksToCountDown(lifeSentenceGp, expectedBlockTime, t(`Time's up!`)),
              tip: t(
                `Treasure Hunting Rule: If manager does not withdraw yield from Cabin before this grace period, the user who withdraws it will receive 1% of the unwithdrawn yield.`
              ),
              alert:
                parseInt(lifeSentenceGp) <= 0
                  ? 'danger'
                  : parseInt(blockToHours(lifeSentenceGp, expectedBlockTime, 0)) <= 24
                  ? 'warning'
                  : 'safe',
            }
          : undefined
      }
      tip={t(`Use DPO's crowdfund to buy this TravelCabin.`)}
      transaction={{
        section: 'bulletTrain',
        method: 'dpoBuyTravelCabin',
        params: {
          buyerDpoIdx: dpoInfo.index.toString(),
          travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
        },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
