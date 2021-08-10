import ActionPlate from 'components/Actions/ActionPlate'
import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { LinearProgressBar } from 'components/ProgressBar'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import Decimal from 'decimal.js'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
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
  selectedState,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
  selectedState?: string
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const [yieldGp, setYieldGp] = useState<string>()
  const theme = useContext(ThemeContext)

  // Stringifying these two states so that useMemo can detect changes
  const targetYieldReceived = dpoInfo.total_yield_received.toString()
  const targetYieldEstimate = dpoInfo.target_yield_estimate.toString()

  // Release Yield Grace Period
  useEffect(() => {
    if (!expectedBlockTime || !lastBlock) return
    const gp = getLazyManagerGpLeft(dpoInfo, lastBlock, expectedBlockTime)
    if (gp) setYieldGp(gp)
  }, [dpoInfo, expectedBlockTime, lastBlock])

  const totalYieldReleasedPercent = useMemo(
    () => new Decimal(targetYieldReceived).div(new Decimal(targetYieldEstimate)).mul(new Decimal(100)),
    [targetYieldEstimate, targetYieldReceived]
  )

  return (
    <ActionPlate
      dpoInfo={dpoInfo}
      selectedState={selectedState}
      actionName={t(`Release Yield Reward`)}
      actionDesc={
        <>
          <RowFixed>
            <BorderedWrapper margin="0.25rem">
              <div style={{ display: 'block' }}>
                <RowFixed align="baseline" justifyContent="center">
                  <HeavyText mobileFontSize="12px" color={theme.green1}>
                    {`${formatToUnit(dpoInfo.vault_yield.toBn(), chainDecimals)} `}
                  </HeavyText>
                  <TokenText color={theme.green1} fontSize="10px" mobileFontSize="8px" padding="0 0.25rem">
                    {dpoInfo.token_id.asToken.toString()}
                  </TokenText>
                </RowFixed>
                <RowFixed width="100%" justifyContent="center">
                  <SText
                    width="fit-content"
                    textAlign="center"
                    fontSize="12px"
                    mobileFontSize="10px"
                    style={{ paddingRight: '0.25rem' }}
                  >
                    {t(`Yield Available`).toUpperCase()}
                  </SText>
                  <QuestionHelper
                    text={t(`Yield available to release to DPO Members`)}
                    size={12}
                    backgroundColor={'transparent'}
                  />
                </RowFixed>
              </div>
            </BorderedWrapper>
            <BorderedWrapper margin="0.25rem">
              <div style={{ display: 'block' }}>
                <RowFixed>
                  <LinearProgressBar value={totalYieldReleasedPercent.toNumber()} />
                  <HeavyText padding="0 0 0 0.25rem" textAlign="center" mobileFontSize="12px" color={theme.green1}>
                    {`${totalYieldReleasedPercent.round()} % `}
                  </HeavyText>
                </RowFixed>
                <RowFixed width="100%" justifyContent="center">
                  <SText
                    width="fit-content"
                    textAlign="center"
                    fontSize="12px"
                    mobileFontSize="10px"
                    style={{ paddingRight: '0.25rem' }}
                  >
                    {t(`Total Received`).toUpperCase()}
                  </SText>
                  <QuestionHelper
                    text={t(
                      `Percentage of the expected total yield received by this DPO. Might be less than 100% (e.g. Yield was given away for Treasure Hunting)`
                    )}
                    size={12}
                    backgroundColor={'transparent'}
                  />
                </RowFixed>
              </div>
            </BorderedWrapper>
          </RowFixed>
        </>
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
      disableButton={dpoInfo.vault_yield.isZero()}
    />
  )
}
