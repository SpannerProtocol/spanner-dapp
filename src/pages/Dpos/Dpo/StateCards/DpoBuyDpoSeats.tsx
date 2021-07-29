import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoInTargetDpo, useSubDpo } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import ActionRow from 'components/Actions/ActionRow'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { getLifeSentenceGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'
import { isDpoAvailable } from 'utils/isTargetAvailable'
import DpoBuyTargetNotAvailable from './DpoBuyTargetNotAvailable'
import { getDpoMinimumPurchase } from '../../../../utils/getDpoData'

/**
 * When the default target is available
 */
function DpoBuyDpoSeatsAvailable({
  dpoInfo,
  dpoAction,
  targetDpo,
  isLast,
  selectedState,
}: {
  dpoInfo: DpoInfo
  targetDpo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
  selectedState?: string
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  // const inTarget = useDpoInTargetDpo(dpoInfo)
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [lifeSentenceGp, setLifeSentenceGp] = useState<string>()
  const { chainDecimals } = useSubstrate()
  const minimumPurchase = getDpoMinimumPurchase(targetDpo)
  const canBuy = dpoInfo.vault_deposit.gte(minimumPurchase)

  // Grace Period life sentence
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock) return
    const gp = getLifeSentenceGpLeft(dpoInfo, lastBlock, expectedBlockTime)
    if (gp) setLifeSentenceGp(gp)
  }, [dpoInfo, expectedBlockTime, lastBlock])

  const token = useMemo(() => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : ''), [dpoInfo])
  return (
    <ActionRow
      dpoInfo={dpoInfo}
      selectedState={selectedState}
      actionName={t('Buy DPO Seats')}
      tip={`${t(`Use crowdfund amount to buy seats from Target DPO`)}`}
      buttonText={t(`Buy`)}
      icon={ACTION_ICONS[dpoAction.action]}
      gracePeriod={
        lifeSentenceGp && !dpoInfo.vault_deposit.isZero() && lastBlock && expectedBlockTime
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
        method: 'dpoBuyDpoShare',
        params: {
          buyerDpoIdx: dpoInfo.index.toString(),
          targetDpoIdx: dpoInfo.target.asDpo[0].toString(),
          amount: dpoInfo.vault_deposit.toString(),
        },
      }}
      txContent={
        <>
          <SpacedSection>
            <SText>{t(`Confirm Purchase of DPO Seats`)}</SText>
          </SpacedSection>
          <Divider />
          {targetDpo && (
            <SpacedSection>
              <RowBetween>
                <SText>{t(`DPO Name`)}</SText>
                <SText>{targetDpo.name.toString()}</SText>
              </RowBetween>
              <RowBetween>
                <SText>{t(`Deposit`)}</SText>
                <SText>
                  {formatToUnit(dpoInfo.vault_deposit.toBn(), chainDecimals)} {token}
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
      setEstimatedFee={setEstimatedFee}
      isLast={isLast}
      disableButton={!canBuy}
    />
  )
}

export default function DpoBuyDpoSeats(props: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
  selectedState?: string
}) {
  const { dpoInfo } = props
  const targetDpo = useSubDpo(dpoInfo.target.asDpo[0].toString())
  const inTarget = useDpoInTargetDpo(dpoInfo)

  if (!targetDpo) return null

  if (isDpoAvailable(dpoInfo, targetDpo) || inTarget) {
    return <DpoBuyDpoSeatsAvailable {...props} targetDpo={targetDpo} />
  } else {
    return <DpoBuyTargetNotAvailable {...props} />
  }
}
