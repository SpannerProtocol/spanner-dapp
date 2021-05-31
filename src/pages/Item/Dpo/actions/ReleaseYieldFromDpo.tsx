import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Item/actions'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { getLazyManagerGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function ReleaseYieldFromDpo({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [yieldGp, setYieldGp] = useState<string>()

  // Release Yield Grace Period
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock) return
    const gp = getLazyManagerGpLeft(dpoInfo, lastBlock, expectedBlockTime)
    if (gp) setYieldGp(gp)
  }, [dpoInfo, expectedBlockTime, lastBlock])

  return (
    <Action
      txContent={
        <>
          <SText>{t(`Confirm Release Yield rewards to Members of DPO.`)}</SText>
          <BorderedWrapper>
            <RowBetween>
              <SText>{t(`Total Release Amount`)}</SText>
              <SText>
                {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {dpoInfo.token_id.asToken.toString()}
              </SText>
            </RowBetween>
          </BorderedWrapper>
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t(`Release Yield Reward`)}
      tip={t(`Release Yield Rewards from DPO Vault to Members.`)}
      buttonText={t('Release')}
      gracePeriod={
        yieldGp && lastBlock && expectedBlockTime
          ? {
              timeLeft: blocksToCountDown(yieldGp, expectedBlockTime, t(`Time's up!`)),
              tip: t(
                `Lazy Manager Rule: Manager must release the yield before this time otherwise is at risk of having their fee slashed in half.`
              ),
              alert:
                parseInt(yieldGp) <= 0
                  ? 'danger'
                  : parseInt(blockToHours(yieldGp, expectedBlockTime, 0)) <= 24
                  ? 'warning'
                  : 'safe',
            }
          : undefined
      }
      icon={ACTION_ICONS[dpoAction.action]}
      transaction={{
        section: 'bulletTrain',
        method: 'releaseYieldFromDpo',
        params: {
          dpoIdx: dpoInfo.index.toString(),
        },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
