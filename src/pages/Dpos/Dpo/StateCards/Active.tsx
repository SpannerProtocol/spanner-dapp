import { SLink } from 'components/Link'
import { RowBetween, RowFixed } from 'components/Row'
import { Header2, Header4, SText } from 'components/Text'
import { useDpoInTargetDpo, useSubDpo } from 'hooks/useQueryDpos'
import { useDpoPurchasedCabin, useSubTravelCabin, useSubTravelCabinInventory } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces/types'
import isDpoStateCompleted from 'utils/dpoStateCompleted'
import { formatToUnit } from 'utils/formatUnit'
import DpoActions from '.'

function TargetDpo({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())
  const isTargetMember = useDpoInTargetDpo(dpoInfo)
  if (!target) return null
  return (
    <>
      {!isTargetMember && (
        <RowFixed>
          <SLink to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/details`} colorIsBlue padding="0 0.25rem 0 0">
            {target.name.toString()}
          </SLink>
          {!target.empty_seats.isZero() ? (
            <Header4 width="fit-content">{t(`is available for purchase`)}</Header4>
          ) : (
            <Header4 width="fit-content">{`${t(`is not available for purchase`)}}. ${t(
              `Please select another asset to target`
            )}.`}</Header4>
          )}
        </RowFixed>
      )}
    </>
  )
}

function TargetCabin({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const inventoryCount = useSubTravelCabinInventory(dpoInfo.target.asTravelCabin.toString())
  const targetPurchased = useDpoPurchasedCabin(dpoInfo.index.toString(), target?.index.toString())

  if (!target || !inventoryCount) return null
  return (
    <>
      {!targetPurchased && (
        <RowFixed>
          <>
            <SLink
              to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}`}
              colorIsBlue
              padding="0 0.25rem 0 0"
            >
              {t(`TravelCabin`)}: {target.name.toString()}
            </SLink>
            {inventoryCount[1].toNumber() - inventoryCount[0].toNumber() > 0 ? (
              <SText width="fit-content">{t(`is available for purchase`)}</SText>
            ) : (
              <SText width="fit-content">{`${t(`is not available for purchase`)}}. ${t(
                `Please select another asset to target`
              )}.`}</SText>
            )}
          </>
        </RowFixed>
      )}
    </>
  )
}

function MainSection({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState: string }) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const stateCompleted = isDpoStateCompleted(dpoInfo, selectedState)

  const token = useMemo(
    () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
    [dpoInfo]
  )

  return (
    <>
      <RowBetween>
        <div style={{ display: 'block' }}>
          {stateCompleted ? (
            <Header2 width="fit-content">{t(`Bought Target`)}</Header2>
          ) : (
            <Header2 width="fit-content">{t(`Buy Target`)}</Header2>
          )}
          <SText>
            {`${dpoInfo.name.toString()} ${t(`raised`)} 
            ${formatToUnit(dpoInfo.target_amount.toBn(), chainDecimals)} ${token}`}
          </SText>
        </div>
      </RowBetween>
      {dpoInfo.target.isDpo ? <TargetDpo dpoInfo={dpoInfo} /> : <TargetCabin dpoInfo={dpoInfo} />}
      <DpoActions dpoInfo={dpoInfo} selectedState={selectedState} />
    </>
  )
}

/**
 * ACTIVE STATUS
 * Main objective is to get the user to buy the target or switch if unavailable
 * - Show user valuable information
 * - curState is the state the user filters not dpoInfo.state
 */
export default function ActiveCard({ dpoInfo, selectedState }: { dpoInfo: DpoInfo; selectedState?: string }) {
  return <>{selectedState === 'ACTIVE' && <MainSection dpoInfo={dpoInfo} selectedState={selectedState} />}</>
}
