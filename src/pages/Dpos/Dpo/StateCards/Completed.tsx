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
import { isDpoStateSelectedState } from 'utils/dpoStateCompleted'
import { formatToUnit } from 'utils/formatUnit'
import DpoActions from '.'

function TargetDpo({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())

  if (!target) return null
  return (
    <>
      <RowFixed>
        <SText width="fit-content">
          {`${t(`Crowdfunded for`)} ${dpoInfo.target.asDpo[1].toString()} ${t(`Seats`)} ${t(`from`)}`}
        </SText>
        <SLink to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/details`} colorIsBlue padding="0 0.25rem">
          {target.name.toString()}
        </SLink>
      </RowFixed>
    </>
  )
}

function TargetCabin({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const inventoryCount = useSubTravelCabinInventory(dpoInfo.target.asTravelCabin.toString())

  if (!target || !inventoryCount) return null
  return (
    <>
      <RowFixed>
        <SText width="fit-content">{`${t(`Crowdfunded for`)}`}</SText>
        <SLink to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`} colorIsBlue padding="0 0.25rem">
          {t(`TravelCabin`)}: {target.name.toString()}
        </SLink>
      </RowFixed>
    </>
  )
}

function MainSection({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const dpoStateIsSelectedState = isDpoStateSelectedState(dpoInfo, selectedState)
  const { chainDecimals } = useSubstrate()

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )

  return (
    <>
      <RowBetween>
        <div style={{ display: 'block' }}>
          {dpoStateIsSelectedState ? (
            <>
              <Header2 width="fit-content">{t(`Completed DPO Goal`)}</Header2>
              {dpoInfo.target.isDpo ? <TargetDpo dpoInfo={dpoInfo} /> : <TargetCabin dpoInfo={dpoInfo} />}
            </>
          ) : (
            <>
              <Header2 width="fit-content">{t(`Still in progess`)}</Header2>
            </>
          )}
        </div>
      </RowBetween>
      <DpoActions dpoInfo={dpoInfo} selectedState={selectedState} />
      {dpoStateIsSelectedState ? (
        <>
          <Divider margin="0.5rem 0" />
          <Header3>{t(`Total Rewards Received`)}</Header3>
          <RowBetween>
            <HeavyText>{t(`Yield`)}</HeavyText>
            <RowFixed width="fit-content">
              <SText>{formatToUnit(dpoInfo.total_yield_received.toBn(), chainDecimals)}</SText>
              <TokenText padding="0 0.25rem">{token}</TokenText>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <HeavyText>{t(`Bonus`)}</HeavyText>
            <RowFixed width="fit-content">
              <SText>{formatToUnit(dpoInfo.total_bonus_received.toBn(), chainDecimals)}</SText>
              <TokenText padding="0 0.25rem">{token}</TokenText>
            </RowFixed>
          </RowBetween>
          {dpoInfo.target.isTravelCabin && (
            <RowBetween>
              <HeavyText>{t(`Milestone`)}</HeavyText>
              <RowFixed width="fit-content">
                <SText>{formatToUnit(dpoInfo.total_bonus_received.toBn(), chainDecimals)}</SText>
                <TokenText padding="0 0.25rem">{token}</TokenText>
              </RowFixed>
            </RowBetween>
          )}
        </>
      ) : (
        <>
          <Divider margin="0.5rem 0" />
          <Header3>{t(`Total Rewards Received`)}</Header3>
          <SText>{t(`Summary data will be displayed once DPO goal is complete`)}</SText>
        </>
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
export default function CompletedCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  return <>{selectedState === 'COMPLETED' && <MainSection dpoInfo={dpoInfo} selectedState={selectedState} />}</>
}
