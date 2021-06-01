import Balance from 'components/Balance'
import Divider from 'components/Divider'
import Filter from 'components/Filter'
import { BorderedInput } from 'components/Input'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Item/actions'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, TravelCabinInfo } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'
import BN from 'bn.js'

/**
 * When the default target is not available, there is a form to get the user to input a new target.
 */
export default function DpoBuyTargetNotAvailable({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
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
      if (targetDpoInfo.state.isCreated) {
        // dpoInfo's deposit amount >= 1 of target's seats
        dpoInfo.vault_deposit.gte(targetDpoInfo.amount_per_seat) && validDpos.push(targetDpoInfo)
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
                option.amount_per_seat.toBn(),
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

  return (
    <Action
      actionName={t('Buy Target')}
      tip={`${t(`Use DPO's funds to purchase target.`)} ${dpoInfo.target.asDpo[0].toString()}`}
      form={
        <>
          <SpacedSection>
            <StandardText>{`${t(`Your default target is no longer available.`)}`}</StandardText>
          </SpacedSection>
          <HeavyText>{t(`Select a new target`)}</HeavyText>
          <Divider />
          <SpacedSection>
            <RowBetween>
              <StandardText>{t(`Target Type`)}</StandardText>
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
                  <StandardText>{t(`New Cabin`)}</StandardText>
                  <Filter
                    options={targetCabinOptions}
                    activeOption={targetCabin ? targetCabin.name.toString() : 'Select a Cabin'}
                    modalTitle={t(`Select new target`)}
                  />
                </RowBetween>
              ) : (
                <StandardText>{t(`No Cabins can be purchased by your DPO's Crowdfund Amount.`)}</StandardText>
              )}
            </SpacedSection>
          )}
          {targetType === 'DPO' && targetDpoOptions && (
            <SpacedSection>
              <RowBetween>
                <StandardText>{t(`New DPO`)}</StandardText>
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
              <HeavyText>{t(`Choose number of seats`)}</HeavyText>
              <Divider />
              <SpacedSection>
                <RowBetween>
                  <StandardText>{t(`Cost per seat`)}</StandardText>
                  <StandardText>{formatToUnit(targetDpo.amount_per_seat, chainDecimals, 0)}</StandardText>
                </RowBetween>
                <RowBetween>
                  <StandardText>{t(`Available Seats`)}</StandardText>
                  <StandardText>{targetDpo.empty_seats.toString()}</StandardText>
                </RowBetween>
              </SpacedSection>
              <RowFixed>
                <StandardText>{t(`Seats to Buy`)}</StandardText>
                <QuestionHelper
                  text={t(`As a DPO, you can buy a maximum of 30 seats.`)}
                  size={12}
                  backgroundColor={'#fff'}
                ></QuestionHelper>
              </RowFixed>
              <BorderedInput
                required
                id="dpo-seats"
                type="number"
                placeholder="1 - 30"
                onChange={(e) => setSeatsToBuy(e.target.value)}
                style={{ alignItems: 'flex-end', width: '100%', marginTop: '0' }}
              />
            </>
          )}
        </>
      }
      formTitle={t('Change DPO Target')}
      buttonText={t('Buy')}
      icon={ACTION_ICONS[dpoAction.action]}
      transaction={
        targetType === 'TravelCabin' && targetCabin
          ? {
              section: 'bulletTrain',
              method: 'dpoBuyTravelCabin',
              params: {
                buyerDpoIdx: dpoInfo.index.toString(),
                travelCabinIdx: targetCabin.index.toString(),
              },
            }
          : targetType === 'DPO' && targetDpo
          ? {
              section: 'bulletTrain',
              method: 'dpoBuyDpoSeats',
              params: {
                buyerDpoIdx: dpoInfo.index.toString(),
                targetDpoIdx: targetDpo.index.toString(),
                numberOfSeats: seatsToBuy,
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
            <StandardText>{t(`Confirm purchase`)}</StandardText>
          </SpacedSection>
          {targetType === 'TravelCabin' && targetCabin && (
            <BorderedWrapper>
              <RowBetween>
                <StandardText>{t(`TravelCabin`)}</StandardText>
                <StandardText>{targetCabin.name.toString()}</StandardText>
              </RowBetween>
              <>
                <RowBetween>
                  <StandardText>{t(`Total Deposit`)}</StandardText>
                  <StandardText>
                    {formatToUnit(targetCabin.deposit_amount.toBn(), chainDecimals)}{' '}
                    {targetCabin.token_id.asToken.toString()}
                  </StandardText>
                </RowBetween>
              </>
            </BorderedWrapper>
          )}
          {targetType === 'DPO' && targetDpo && (
            <BorderedWrapper>
              <RowBetween>
                <StandardText>{t(`DPO`)}</StandardText>
                <StandardText>{targetDpo.name.toString()}</StandardText>
              </RowBetween>
              {seatsToBuy && (
                <>
                  <RowBetween>
                    <StandardText>{t(`Seats to Buy`)}</StandardText>
                    <StandardText>
                      {seatsToBuy} {t(`Seats`)}
                    </StandardText>
                  </RowBetween>
                  <RowBetween>
                    <StandardText>{t(`Total Deposit`)}</StandardText>
                    <StandardText>
                      {formatToUnit(targetDpo.amount_per_seat.mul(new BN(seatsToBuy)), chainDecimals)}{' '}
                      {targetDpo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                </>
              )}
            </BorderedWrapper>
          )}
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
    />
  )
}
