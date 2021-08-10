import ActionPlate from 'components/Actions/ActionPlate'
import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin, useSubTravelCabinBuyer } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import { useUserIsDpoMember, useUserIsDpoManager } from 'hooks/useUser'
import useWallet from 'hooks/useWallet'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { ThemeContext } from 'styled-components'
import { blocksToCountDown, blockToHours } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
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
  selectedState,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
  selectedState?: string
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
  const wallet = useWallet()
  const isMember = useUserIsDpoMember(dpoInfo.index, wallet?.address)
  const isManager = useUserIsDpoManager(dpoInfo.index, wallet?.address)

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
    <>
      {targetCabin && (
        <ActionPlate
          dpoInfo={dpoInfo}
          selectedState={selectedState}
          actionName={`${t(`Withdraw Yield from Cabin`)}: ${targetCabin.name.toString()}`}
          actionDesc={
            <>
              <RowFixed>
                <BorderedWrapper margin="0.25rem">
                  <div style={{ display: 'block' }}>
                    <HeavyText width="100%" textAlign="center" mobileFontSize="12px" color={theme.green1}>
                      {`${yieldAvailable} `}
                      {!(yieldAvailable === 'All yield withdrawn') && (
                        <TokenText color={theme.green1} fontSize="10px" mobileFontSize="8px">
                          {dpoInfo.token_id.asToken.toString()}
                        </TokenText>
                      )}
                    </HeavyText>
                    <SText
                      width="100%"
                      textAlign="center"
                      fontSize="12px"
                      mobileFontSize="10px"
                      style={{ paddingRight: '0.25rem' }}
                    >
                      {t(`Yield in Cabin`).toUpperCase()}
                    </SText>
                  </div>
                </BorderedWrapper>
                <BorderedWrapper margin="0.25rem">
                  <div style={{ display: 'block' }}>
                    <HeavyText width="100%" textAlign="center" mobileFontSize="12px" color={theme.green1}>
                      {`${formatToUnit(dpoInfo.total_yield_received.toBn(), chainDecimals)} `}
                      <TokenText color={theme.green1} fontSize="10px" mobileFontSize="8px">
                        {dpoInfo.token_id.asToken.toString()}
                      </TokenText>
                    </HeavyText>
                    <SText
                      width="100%"
                      textAlign="center"
                      fontSize="12px"
                      mobileFontSize="10px"
                      style={{ paddingRight: '0.25rem' }}
                    >
                      {t(`Yield Received`).toUpperCase()}
                    </SText>
                  </div>
                </BorderedWrapper>
              </RowFixed>
            </>
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
              {targetCabin && treasureHuntingGp && (
                <SpacedSection>
                  <SText>{t(`Withdraw yield from TravelCabin to DPO`)}.</SText>
                  {parseInt(treasureHuntingGp) > 0 ? (
                    <SpacedSection>
                      <RowFixed>
                        <SText>
                          <>{!isManager && `${t(`DPO manager still has time to perform this action`)}. `}</>
                          {isMember && !isManager && <>{t(`You can perform this action if you don't want to wait`)}.</>}
                          {!isMember && !isManager && (
                            <>{t(`You are not a member but you can perform this action on behalf of the DPO`)}.</>
                          )}
                        </SText>
                      </RowFixed>
                    </SpacedSection>
                  ) : (
                    <SpacedSection>
                      <RowFixed>
                        <SText>
                          {!isManager && (
                            <>
                              <b>{`${t(`Treasure Hunting`)}! `}</b>
                              <>
                                {t(
                                  `Manager did not withdraw the yield in time. Withdraw the yield for the DPO to receive 1% of the accumulated unwithdrawn yield.`
                                )}
                              </>
                            </>
                          )}
                        </SText>
                      </RowFixed>
                    </SpacedSection>
                  )}
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
                  {!isManager && treasureHuntingGp && parseInt(treasureHuntingGp) <= 0 && (
                    <RowBetween>
                      <SText width="fit-content">{`${t(`Treasure Hunting`)} ${t(`Reward`)}`}</SText>
                      <SText width="fit-content">
                        {(parseFloat(yieldAvailable) * 0.01).toFixed(4)} {dpoInfo.token_id.asToken.toString()}
                      </SText>
                    </RowBetween>
                  )}
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
      )}
    </>
  )
}
