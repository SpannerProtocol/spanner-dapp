import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Item/actions'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { ThemeContext } from 'styled-components'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { getLazyManagerGpLeft } from 'utils/getCabinData'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function ReleaseYieldFromDpo({
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
  const { chainDecimals } = useSubstrate()
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [yieldGp, setYieldGp] = useState<string>()
  const theme = useContext(ThemeContext)

  // Release Yield Grace Period
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock) return
    const gp = getLazyManagerGpLeft(dpoInfo, lastBlock, expectedBlockTime)
    if (gp) setYieldGp(gp)
  }, [dpoInfo, expectedBlockTime, lastBlock])

  return (
    <Action
      actionName={t(`Release Yield Reward`)}
      actionDesc={
        <RowFixed>
          <SText width="fit-content" fontSize="10px" mobileFontSize="10px" style={{ paddingRight: '0.25rem' }}>
            {t(`Yield`)}:
          </SText>
          <HeavyText width="fit-content" mobileFontSize="10px" color={theme.green1}>
            {`${formatToUnit(dpoInfo.vault_yield.toBn(), chainDecimals)} `}
            <TokenText color={theme.green1}>{dpoInfo.token_id.asToken.toString()}</TokenText>
          </HeavyText>
        </RowFixed>
      }
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
      txContent={
        <>
          <SpacedSection>
            <SText>{t(`Confirm Release Yield rewards to Members of DPO.`)}</SText>
          </SpacedSection>
          <Divider />
          <SpacedSection>
            <RowBetween>
              <SText width="fit-content">{t(`Total Release Amount`)}</SText>
              <SText width="fit-content">
                {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {dpoInfo.token_id.asToken.toString()}
              </SText>
            </RowBetween>
          </SpacedSection>
          <Divider />
          <SpacedSection>
            <Balance token={dpoInfo.token_id.asToken.toString()} />
            <TxFee fee={estimatedFee} />
          </SpacedSection>
        </>
      }
      setEstimatedFee={setEstimatedFee}
      isLast={isLast}
    />
  )
}
