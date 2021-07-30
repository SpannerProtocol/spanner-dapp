import Balance from 'components/Balance'
import Divider from 'components/Divider'
import Filter from 'components/Filter'
import { BorderedInput } from 'components/Input'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useSubstrate } from 'hooks/useSubstrate'
import ActionRow from 'components/Actions/ActionRow'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, Target, TravelCabinInfo } from 'spanner-api/types'
import { formatToUnit, unitToBnWithDecimal } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'
import { getDpoMinimumPurchase, getDpoRemainingPurchase } from '../../../../utils/getDpoData'
import useConsts from '../../../../hooks/useConsts'
import BN from 'bn.js'
import Decimal from 'decimal.js'

function isValidNewTargetDpo(dpoInfo: DpoInfo, newTargetDpo: DpoInfo): boolean {
  if (!newTargetDpo.state.isCreated) {
    return false
  }
  if (dpoInfo.index.toString() === newTargetDpo.index.toString()) {
    return false
  }
  if (dpoInfo.target.isDpo && dpoInfo.target.asDpo[0].toString() === newTargetDpo.index.toString()) {
    return false
  }
  if (dpoInfo.vault_deposit.lt(getDpoMinimumPurchase(newTargetDpo))) {
    return false
  }
  return true
}

/**
 * When the default target is not available, there is a form to get the user to input a new target.
 */
export default function DpoBuyTargetNotAvailable({
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
  const [seatsToBuy, setSeatsToBuy] = useState<string>()
  const { t } = useTranslation()
  const [targetType, setTargetType] = useState<string>('DPO')
  const { api, connected } = useApi()
  const [targetDpoOptions, setTargetDpoOptions] = useState<{ label: string; callback: () => void }[]>()
  const [targetCabinOptions, setTargetCabinOptions] = useState<{ label: string; callback: () => void }[]>()
  const [targetDpo, setTargetDpo] = useState<DpoInfo>()
  const [targetCabin, setTargetCabin] = useState<TravelCabinInfo>()
  const { chainDecimals } = useSubstrate()

  const filterTargetTypeOptions = useMemo(() => {
    const options = ['DPO', 'TravelCabin']
    return options.map((label) => ({ label, callback: () => setTargetType(label) }))
  }, [])

  // If target type is cabin, check the crowdfunding amount and show user available targets.
  const getAvailableCabins = useCallback(async () => {
    if (!connected) return
    const cabinEntries = await api.query.bulletTrain.travelCabins.entries()
    const validCabins: TravelCabinInfo[] = []
    cabinEntries.forEach((entry) => {
      if (entry[1].isNone) return
      const cabinInfo = entry[1].unwrapOrDefault()
      dpoInfo.vault_deposit.gte(cabinInfo.deposit_amount) &&
        !validCabins.includes(cabinInfo) &&
        validCabins.push(cabinInfo)
    })
    return validCabins
  }, [api, connected, dpoInfo])

  // If target type is dpo, check dpos in CREATE state
  const getAvailableDpos = useCallback(async () => {
    if (!connected) return
    const dpoEntries = await api.query.bulletTrain.dpos.entries()
    const validDpos: DpoInfo[] = []
    dpoEntries.forEach((entry) => {
      if (entry[1].isNone) return
      const targetDpoInfo = entry[1].unwrapOrDefault()
      if (isValidNewTargetDpo(dpoInfo, targetDpoInfo)) {
        validDpos.push(targetDpoInfo)
      }
    })
    return validDpos
  }, [api, connected, dpoInfo])

  useEffect(() => {
    ;(async () => {
      try {
        if (targetType === 'TravelCabin') {
          const cabinOptions = await getAvailableCabins()
          if (!cabinOptions) return
          setTargetCabinOptions(
            cabinOptions.map((option) => {
              return {
                label: `${option.name.toString()} - ${formatToUnit(
                  option.deposit_amount.toBn(),
                  chainDecimals,
                  0,
                  true
                )} ${option.token_id.asToken.toString()}`,
                callback: () => setTargetCabin(option),
              }
            })
          )
        } else if (targetType === 'DPO') {
          const dpoOptions = await getAvailableDpos()
          if (!dpoOptions) return
          setTargetDpoOptions(
            dpoOptions.map((option) => ({
              label: `${option.name.toString()} - ${formatToUnit(
                getDpoMinimumPurchase(option),
                chainDecimals,
                0,
                true
              )} ${option.token_id.asToken.toString()} ${t(`per seat`)}`,
              callback: () => setTargetDpo(option),
            }))
          )
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [chainDecimals, getAvailableCabins, getAvailableDpos, t, targetType])

  const dpoTargetStr = dpoInfo.target.isDpo
    ? dpoInfo.target.asDpo[0].toString()
    : dpoInfo.target.isTravelCabin
    ? dpoInfo.target.asTravelCabin.toString
    : ''

  let target: Target
  if (targetType === 'TravelCabin' && targetCabin) {
    target = api.createType('Target', { TravelCabin: targetCabin.index.toString() })
  } else if (targetType === 'DPO' && targetDpo && seatsToBuy) {
    target = api.createType('Target', {
      Dpo: [targetDpo.index.toString(), unitToBnWithDecimal(parseFloat(seatsToBuy), chainDecimals)],
    })
  } else {
    target = api.createType('Target', { TravelCabin: '0' })
  }
  const token = dpoInfo && dpoInfo.token_id.isToken && dpoInfo.token_id.asToken.toString()

  const { dpoSharePercentCap, dpoSharePercentMinimum } = useConsts()

  const dpoShareCap =
    dpoSharePercentCap && targetDpo
      ? new BN(new Decimal(targetDpo.target_amount.toString()).mul(dpoSharePercentCap).toString())
      : new BN(0)
  const dpoShareMinimum =
    dpoSharePercentMinimum && targetDpo
      ? new BN(new Decimal(targetDpo.target_amount.toString()).mul(dpoSharePercentMinimum).toString())
      : new BN(0)

  return (
    <ActionRow
      dpoInfo={dpoInfo}
      selectedState={selectedState}
      actionName={t('Change Target')}
      tip={`${t(`Your default target is no longer available.`)} ${dpoTargetStr}`}
      form={
        <>
          <SpacedSection>
            <SText>{`${t(`Your default target is no longer available.`)}`}</SText>
          </SpacedSection>
          <HeavyText>{t(`Select a new target`)}</HeavyText>
          <Divider />
          <SpacedSection>
            <RowBetween>
              <SText>{t(`Target Type`)}</SText>
              <Filter
                options={filterTargetTypeOptions}
                activeOption={targetType}
                modalTitle={t(`Select target type`)}
              />
            </RowBetween>
          </SpacedSection>
          {targetType === 'TravelCabin' && targetCabinOptions && (
            <SpacedSection>
              {targetCabinOptions.length > 0 ? (
                <RowBetween>
                  <SText>{t(`New Cabin`)}</SText>
                  <Filter
                    options={targetCabinOptions}
                    activeOption={targetCabin ? targetCabin.name.toString() : 'Select a Cabin'}
                    modalTitle={t(`Select new target`)}
                  />
                </RowBetween>
              ) : (
                <SText>{t(`No Cabins can be purchased by your DPO's Crowdfund Amount.`)}</SText>
              )}
            </SpacedSection>
          )}
          {targetType === 'DPO' && targetDpoOptions && (
            <SpacedSection>
              <RowBetween>
                <SText>{t(`New DPO`)}</SText>
                <Filter
                  options={targetDpoOptions}
                  activeOption={targetDpo ? targetDpo.name.toString() : 'Select a DPO'}
                  modalTitle={t(`Select new target`)}
                />
              </RowBetween>
            </SpacedSection>
          )}
          {targetType === 'DPO' && targetDpo && (
            <>
              <HeavyText>{t(`Choose number of shares`)}</HeavyText>
              <Divider />
              <SpacedSection>
                <RowBetween>
                  <SText>{t(`Remaining`)}</SText>
                  <SText>
                    {formatToUnit(getDpoRemainingPurchase(targetDpo), chainDecimals, 2)} {token}
                  </SText>
                </RowBetween>
              </SpacedSection>
              <RowFixed>
                <SText>{t(`Share to Buy`)}</SText>
                <QuestionHelper
                  text={t(`As a DPO, you can buy a maximum of 50% Share.`)}
                  size={12}
                  backgroundColor={'#fff'}
                />
              </RowFixed>
              <BorderedInput
                required
                id="dpo-seats"
                type="number"
                placeholder={`${formatToUnit(dpoShareMinimum, chainDecimals, 2)} - ${formatToUnit(
                  dpoShareCap,
                  chainDecimals,
                  2
                )} ${token}`}
                onChange={(e) => setSeatsToBuy(e.target.value)}
                style={{ alignItems: 'flex-end', width: '100%', marginTop: '0' }}
              />
            </>
          )}
        </>
      }
      formTitle={t('Change DPO Target')}
      buttonText={t('Change')}
      icon={ACTION_ICONS[dpoAction.action]}
      transaction={
        target
          ? {
              section: 'bulletTrain',
              method: 'dpoChangeTarget',
              params: {
                buyerDpoIdx: dpoInfo.index.toString(),
                newTarget: target,
              },
            }
          : // only way to conditional render this
            {
              section: '',
              method: '',
              params: {},
            }
      }
      setEstimatedFee={setEstimatedFee}
      txContent={
        <>
          <SpacedSection>
            <SText>{t(`Confirm purchase`)}</SText>
          </SpacedSection>
          <Divider />
          {targetType === 'TravelCabin' && targetCabin && (
            <SpacedSection>
              <RowBetween>
                <SText>{t(`TravelCabin`)}</SText>
                <SText>{targetCabin.name.toString()}</SText>
              </RowBetween>
              <>
                <RowBetween>
                  <SText>{t(`Total Deposit`)}</SText>
                  <SText>
                    {formatToUnit(targetCabin.deposit_amount.toBn(), chainDecimals)}{' '}
                    {targetCabin.token_id.asToken.toString()}
                  </SText>
                </RowBetween>
              </>
            </SpacedSection>
          )}
          {targetType === 'DPO' && targetDpo && (
            <SpacedSection>
              <RowBetween>
                <SText>{t(`DPO`)}</SText>
                <SText>{targetDpo.name.toString()}</SText>
              </RowBetween>
              {seatsToBuy && (
                <>
                  <RowBetween>
                    <SText>{t(`Crowdfund Amount`)}</SText>
                    <SText>
                      {seatsToBuy} {targetDpo.token_id.asToken.toString()}
                    </SText>
                  </RowBetween>
                </>
              )}
            </SpacedSection>
          )}
          <Divider />
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      isLast={isLast}
    />
  )
}
