import Divider from 'components/Divider'
import { SLink } from 'components/Link'
import { RowBetween, RowFixed } from 'components/Row'
import { Header2, Header3, HeavyText, SText, TokenText } from 'components/Text'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin, useSubTravelCabinInventory } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces/types'
import isDpoStateCompleted, { isDpoStateSelectedState } from 'utils/dpoStateCompleted'
import { formatToUnit } from 'utils/formatUnit'
import DpoActions from '.'

function TargetDpo({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const stateCompleted = isDpoStateCompleted(dpoInfo, selectedState)
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())
  if (!target) return null
  return (
    <>
      <RowFixed>
        {stateCompleted ? (
          <SText width="fit-content">{`${t(`All rewards were received`)} ${t(`from`)}`}</SText>
        ) : (
          <SText width="fit-content">{`${t(`Rewards will be released to this DPO`)} ${t(`by`)}`}</SText>
        )}
        <SLink to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/details`} colorIsBlue padding="0 0 0 0.25rem">
          {target.name.toString()}
        </SLink>
      </RowFixed>
    </>
  )
}

function TargetCabin({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const stateCompleted = isDpoStateCompleted(dpoInfo, selectedState)
  const inventoryCount = useSubTravelCabinInventory(dpoInfo.target.asTravelCabin.toString())
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)

  if (!target || !inventoryCount) return null
  return (
    <>
      <RowFixed>
        {stateCompleted ? (
          <SText width="fit-content">{`${t(`All yield rewards withdrawn`)} ${t(`from`)}`}</SText>
        ) : (
          <>
            {dpoStateIsSelectedState ? (
              <SText width="fit-content">{`${t(`Yield rewards accumulating`)} ${t(`in`)}`}</SText>
            ) : (
              <SText width="fit-content">{`${t(`Yield rewards will be withdrawn`)} ${t(`from`)}`}</SText>
            )}
          </>
        )}
        <SLink
          to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`}
          colorIsBlue
          padding="0 0 0 0.25rem"
        >
          {t(`TravelCabin`)}: {target.name.toString()}
        </SLink>
      </RowFixed>
    </>
  )
}

function MainSection({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const stateCompleted = isDpoStateCompleted(dpoInfo, selectedState)
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)

  return (
    <>
      <RowBetween>
        <div style={{ display: 'block' }}>
          {stateCompleted ? (
            <Header2 width="fit-content">{t(`All Rewards Received`)}</Header2>
          ) : (
            <>
              {dpoStateIsSelectedState ? (
                <>
                  <Header2 width="fit-content">{t(`Get Rewards`)}</Header2>
                </>
              ) : (
                <Header2 width="fit-content">{t(`Buy Target for Rewards`)}</Header2>
              )}
            </>
          )}
        </div>
      </RowBetween>
      {dpoInfo.target.isDpo ? (
        <TargetDpo dpoInfo={dpoInfo} selectedState={selectedState} />
      ) : (
        <TargetCabin dpoInfo={dpoInfo} selectedState={selectedState} />
      )}
      <DpoActions dpoInfo={dpoInfo} selectedState={selectedState} />
    </>
  )
}

export function RunningDetails({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )

  return (
    <>
      <Divider margin="0.5rem 0" />
      <Header3>{t(`Total Rewards Received`)}</Header3>
      <RowBetween>
        <HeavyText>{t(`Yield`)}</HeavyText>
        <SText>
          {formatToUnit(dpoInfo.total_yield_received.toBn(), chainDecimals)}
          <TokenText padding="0 0.25rem">{token}</TokenText>
        </SText>
      </RowBetween>
      <RowBetween>
        <HeavyText>{t(`Bonus`)}</HeavyText>
        <SText>
          {formatToUnit(dpoInfo.total_bonus_received.toBn(), chainDecimals)}
          <TokenText padding="0 0.25rem">{token}</TokenText>
        </SText>
      </RowBetween>
      {dpoInfo.target.isTravelCabin && (
        <RowBetween>
          <HeavyText>{t(`Milestone`)}</HeavyText>
          <SText>
            {formatToUnit(dpoInfo.total_bonus_received.toBn(), chainDecimals)}
            <TokenText padding="0 0.25rem">{token}</TokenText>
          </SText>
        </RowBetween>
      )}
    </>
  )
}

/**
 * ACTIVE STATUS
 * Main objective is to get the user to buy the target or switch if unavailable
 * - Show user valuable information
 * - curState is the state the user filters not dpoInfo.state
 */
export default function RunningCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  return <>{selectedState === 'RUNNING' && <MainSection dpoInfo={dpoInfo} selectedState={selectedState} />}</>
}
