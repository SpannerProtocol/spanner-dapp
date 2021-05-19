import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubDpo } from 'hooks/useQueryDpos'
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
export default function DpoBuyDpoSeatsAvailable({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const targetDpo = useSubDpo(dpoInfo.target.asDpo.toString())
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [lifeSentenceGp, setLifeSentenceGp] = useState<string>()

  // Release Yield Grace Period
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
            <StandardText>{t(`Confirm Purchase of DPO Seats`)}</StandardText>
          </SpacedSection>
          {targetDpo && (
            <BorderedWrapper>
              <RowBetween>
                <StandardText>{t(`DPO Name`)}</StandardText>
                <StandardText>{targetDpo.name.toString()}</StandardText>
              </RowBetween>
            </BorderedWrapper>
          )}
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Buy DPO Seats')}
      tip={`${t(`Use DPO's crowdfund to buy seats from DPO`)} ${dpoInfo.target.asDpo[0].toString()}`}
      buttonText={t(`Buy`)}
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
      transaction={{
        section: 'bulletTrain',
        method: 'dpoBuyDpoSeats',
        params: {
          buyerDpoIdx: dpoInfo.index.toString(),
          targetDpoIdx: dpoInfo.target.asDpo[0].toString(),
          numberOfSeats: dpoInfo.target.asDpo[1].toString(),
        },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
