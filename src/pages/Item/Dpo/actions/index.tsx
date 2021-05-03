import { FlatCard } from 'components/Card'
import { BorderedInput } from 'components/Input'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { Section, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useDpoActions } from 'hooks/useDpoActions'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useDPOTravelCabinInventoryIndex } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import { getCabinClassByIndex } from 'utils/getCabinClass'
import { DpoAction } from 'utils/getDpoActions'
import { isDpoAvailable, isTravelCabinAvailable } from 'utils/isTargetAvailable'
import { ACTION_ICONS } from '../../../../constants'
import Action from '../../actions'

interface ActionProviderProps {
  dpoInfo: DpoInfo
  dpoIndex: DpoIndex | number | string
  dpoActions?: DpoAction[]
}

/**
 * Provides Action components for a single DPO
 */
function ActionProvider(props: ActionProviderProps): JSX.Element {
  const { dpoInfo, dpoIndex } = props
  const { api, connected } = useApi()
  const {
    dpoActions,
    targetTravelCabin,
    targetTravelCabinInventory,
    targetTravelCabinInventoryIndex,
    targetDpo,
  } = useDpoActions(dpoInfo)
  const [userActions, setUserActions] = useState<Array<JSX.Element>>()
  const targetInventoryIndex = useDPOTravelCabinInventoryIndex(dpoInfo.index.toString(), targetTravelCabin?.index)
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { chainDecimals } = useSubstrate()

  const { t } = useTranslation()

  // Conditional action states for callbacks
  const [seatsToBuy, setSeatsToBuy] = useState<string>()
  const [newTargetIndex, setNewTargetIndex] = useState<string>()

  // When dpoActions are present, parse the actions and generate Action components
  useEffect(() => {
    if (!connected || !dpoActions) return
    const filteredDpoActions = dpoActions.map((dpoAction) => {
      if (dpoAction.action === 'releaseFareFromDpo') {
        return (
          <Action
            txContent={
              <>
                <StandardText>
                  {t(`Confirm Release Deposit from DPO`)}: {dpoInfo.name.toString()}
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={t('Release Deposit')}
            tip={t(
              `Releasing Deposit will withdraw the deposit in this DPO's Deposit Vault and release it to all members. If target is TravelCabin, deposit is for Ticket Fare. If target is another DPO, deposit is for the DPO Seats.`
            )}
            icon={ACTION_ICONS[dpoAction.action]}
            buttonText={t('Release')}
            transaction={{
              section: 'bulletTrain',
              method: 'releaseFareFromDpo',
              params: { dpoIdx: dpoIndex },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else if (dpoAction.action === 'withdrawFareFromTravelCabin') {
        // check if this is the right stock index
        if (!targetTravelCabinInventoryIndex) return undefined
        return (
          <Action
            txContent={
              <>
                <StandardText>
                  {`${t(`Confirm Withdraw Ticket Fare from TravelCabin`)}: ${dpoInfo.target.asTravelCabin.toString()}`}
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={t(`Withdraw Ticket Fare`)}
            tip={t(`Withdraw Ticket Fare from Target TravelCabin.`)}
            buttonText={t(`Withdraw`)}
            icon={ACTION_ICONS[dpoAction.action]}
            transaction={{
              section: 'bulletTrain',
              method: 'withdrawFareFromTravelCabin',
              params: {
                travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
                travelCabinNumber: targetTravelCabinInventoryIndex.toString(),
              },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else if (dpoAction.action === 'dpoBuyTravelCabin') {
        // If not available, user needs to enter index of cabin that is
        return (
          <>
            {targetTravelCabinInventory && isTravelCabinAvailable(targetTravelCabinInventory) ? (
              <Action
                txContent={
                  <>
                    <SpacedSection>
                      <StandardText>{t(`Confirm purchase of TravelCabin.`)}</StandardText>
                    </SpacedSection>
                    <SpacedSection>
                      <RowBetween>
                        <StandardText>{t(`Travel Class`)}</StandardText>
                        <StandardText>{getCabinClassByIndex(dpoInfo.target.asTravelCabin.toString())}</StandardText>
                      </RowBetween>
                      <RowBetween>
                        <StandardText>{t(`TravelCabin Id`)}</StandardText>
                        <StandardText>{dpoInfo.target.asTravelCabin.toString()}</StandardText>
                      </RowBetween>
                    </SpacedSection>
                    <TxFee fee={estimatedFee} />
                  </>
                }
                actionName={t('Buy TravelCabin')}
                buttonText={t('Buy')}
                icon={ACTION_ICONS[dpoAction.action]}
                tip={t(`Use DPO's crowdfund to buy this TravelCabin.`)}
                transaction={{
                  section: 'bulletTrain',
                  method: 'dpoBuyTravelCabin',
                  params: {
                    buyerDpoIdx: dpoIndex,
                    travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
                  },
                }}
                setEstimatedFee={setEstimatedFee}
              />
            ) : (
              <Action
                txContent={
                  <>
                    {newTargetIndex && (
                      <>
                        <SpacedSection>
                          <StandardText>{t(`Confirm purchase of TravelCabin.`)}</StandardText>
                        </SpacedSection>
                        <SpacedSection>
                          <RowBetween>
                            <StandardText>{t(`Travel Class`)}</StandardText>
                            <StandardText>{getCabinClassByIndex(newTargetIndex)}</StandardText>
                          </RowBetween>
                          <RowBetween>
                            <StandardText>{t(`TravelCabin Id`)}</StandardText>
                            <StandardText>{newTargetIndex}</StandardText>
                          </RowBetween>
                        </SpacedSection>
                        <TxFee fee={estimatedFee} />
                      </>
                    )}
                  </>
                }
                actionName={t('Buy TravelCabin')}
                form={
                  <>
                    <StandardText>
                      {`${`TravelCabin`}: 
                      ${getCabinClassByIndex(dpoInfo.target.asTravelCabin.toString())} 
                      ${`is no longer available. Please enter a new TravelCabin Id to purchase.`}`}
                    </StandardText>
                    <SpacedSection>
                      <BorderedInput
                        required
                        id="dpo-seats"
                        type="number"
                        placeholder="0"
                        onChange={(e) => setNewTargetIndex(e.target.value)}
                        style={{ alignItems: 'flex-end', width: '100%' }}
                      />
                    </SpacedSection>
                  </>
                }
                formTitle={t('Change TravelCabin Target')}
                buttonText={t('Buy')}
                icon={ACTION_ICONS[dpoAction.action]}
                tip={t(`Use DPO's Crowdfunded Amount to buy this TravelCabin. Leftover amount will remain in Vault`)}
                transaction={{
                  section: 'bulletTrain',
                  method: 'dpoBuyTravelCabin',
                  params: {
                    buyerDpoIdx: dpoIndex,
                    travelCabinIdx: newTargetIndex,
                  },
                }}
                setEstimatedFee={setEstimatedFee}
              />
            )}
          </>
        )
      } else if (dpoAction.action === 'dpoBuyDpoSeats') {
        if (!targetDpo || !dpoInfo.target.isDpo) return undefined
        // If not available, user needs to enter index of cabin that is
        return (
          <>
            {isDpoAvailable(dpoInfo, targetDpo) ? (
              <Action
                txContent={
                  <>
                    <SpacedSection>
                      <StandardText>{t(`Confirm Purchase of DPO Seats`)}</StandardText>
                    </SpacedSection>
                    <SpacedSection>
                      <RowBetween>
                        <StandardText>{t(`DPO Id`)}</StandardText>
                        <StandardText>{dpoInfo.target.asDpo[0].toString()}</StandardText>
                      </RowBetween>
                    </SpacedSection>
                    <TxFee fee={estimatedFee} />
                  </>
                }
                actionName={t('Buy DPO Seats')}
                tip={`${t(`Use DPO's crowdfund to buy seats from DPO`)} ${dpoInfo.target.asDpo[0].toString()}`}
                buttonText={t(`Buy`)}
                icon={ACTION_ICONS[dpoAction.action]}
                transaction={{
                  section: 'bulletTrain',
                  method: 'dpoBuyDpoSeats',
                  params: {
                    buyerDpoIdx: dpoIndex,
                    targetDpoIdx: dpoInfo.target.asDpo[0].toString(),
                    numberOfSeats: dpoInfo.target.asDpo[1].toString(),
                  },
                }}
                setEstimatedFee={setEstimatedFee}
              />
            ) : (
              <Action
                txContent={
                  <>
                    {newTargetIndex && (
                      <>
                        <SpacedSection>
                          <StandardText>{t(`Confirm Purchase of DPO Seats`)}</StandardText>
                        </SpacedSection>
                        <SpacedSection>
                          <RowBetween>
                            <StandardText>{t(`DPO Id`)}</StandardText>
                            <StandardText>{newTargetIndex}</StandardText>
                          </RowBetween>
                        </SpacedSection>
                        <TxFee fee={estimatedFee} />
                      </>
                    )}
                  </>
                }
                actionName={t('Buy DPO Seats')}
                tip={`${t(`Use DPO's crowdfund to buy seats from DPO`)} ${dpoInfo.target.asDpo[0].toString()}`}
                form={
                  <>
                    <StandardText>
                      {`${`DPO ${dpoInfo.target.asDpo[0].toString()}`} 
                        ${t(`is no longer available. Please enter a new DPO Id to purchase.`)}`}
                    </StandardText>
                    <SpacedSection>
                      <RowFixed>
                        <StandardText>{t(`New DPO Id`)}</StandardText>
                        <QuestionHelper
                          text={t(
                            `The DPO Id of another DPO you want to buy. You can find by looking at the DPO's information page.`
                          )}
                          size={12}
                          backgroundColor={'#fff'}
                        ></QuestionHelper>
                      </RowFixed>
                      <BorderedInput
                        required
                        id="dpo-index"
                        type="number"
                        placeholder={`0`}
                        onChange={(e) => setNewTargetIndex(e.target.value)}
                        style={{ alignItems: 'flex-end', width: '100%' }}
                      />
                    </SpacedSection>
                    <Section>
                      <RowFixed>
                        <StandardText>{t(`Seats to Buy`)}</StandardText>
                        <QuestionHelper
                          text={t(
                            `The # of Seats you wish to buy from THIS DPO will determine the crowdfunding target of YOUR new DPO. The crowdfunding target will be split equally to 100 seats for your DPO members.`
                          )}
                          size={12}
                          backgroundColor={'#fff'}
                        ></QuestionHelper>
                      </RowFixed>
                      <BorderedInput
                        required
                        id="dpo-seats"
                        type="number"
                        placeholder="0.0"
                        onChange={(e) => setSeatsToBuy(e.target.value)}
                        style={{ alignItems: 'flex-end', width: '100%' }}
                      />
                    </Section>
                  </>
                }
                formTitle={t('Change DPO Target')}
                buttonText={t('Buy')}
                icon={ACTION_ICONS[dpoAction.action]}
                transaction={{
                  section: 'bulletTrain',
                  method: 'dpoBuyDpoSeats',
                  params: {
                    buyerDpoIdx: dpoIndex,
                    targetDpoIdx: newTargetIndex,
                    numberOfSeats: seatsToBuy,
                  },
                }}
                setEstimatedFee={setEstimatedFee}
              />
            )}
          </>
        )
      } else if (dpoAction.action === 'withdrawYieldFromTravelCabin') {
        if (!targetInventoryIndex || !dpoInfo.target.isTravelCabin) return undefined
        // Test this to make sure this is the correct stock index
        return (
          <Action
            txContent={
              <>
                <StandardText>{t(`Withdraw Yield from Cabin`)}</StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={t('Withdraw Yield from Cabin')}
            tip={t(`Withdraw accumulated Yield from TravelCabin to DPO vault.`)}
            buttonText={t('Withdraw')}
            icon={ACTION_ICONS[dpoAction.action]}
            transaction={{
              section: 'bulletTrain',
              method: 'withdrawYieldFromTravelCabin',
              params: {
                travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
                travelCabinNumber: targetInventoryIndex,
              },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else if (dpoAction.action === 'releaseYieldFromDpo') {
        return (
          <Action
            txContent={
              <>
                <StandardText>{t(`Confirm Release Yield rewards to Members of DPO.`)}</StandardText>
                <SpacedSection>
                  <RowBetween>
                    <StandardText>{t(`Total Release Amount`)}</StandardText>
                    <StandardText>
                      {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {dpoInfo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                </SpacedSection>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={t(`Release Yield Reward`)}
            tip={t(`Release Yield Rewards from DPO Vault to Members.`)}
            buttonText={t('Release')}
            icon={ACTION_ICONS[dpoAction.action]}
            transaction={{
              section: 'bulletTrain',
              method: 'releaseYieldFromDpo',
              params: {
                dpoIdx: dpoIndex,
              },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else if (dpoAction.action === 'releaseBonusFromDpo') {
        return (
          <Action
            txContent={
              <>
                <StandardText>{t(`Release Bonus Rewards`)}</StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={t('Release Bonus Reward')}
            tip={t(`Release Bonus Reward from Bonus Vault to Members of DPO.`)}
            buttonText={t('Release')}
            icon={ACTION_ICONS[dpoAction.action]}
            transaction={{
              section: 'bulletTrain',
              method: 'releaseBonusFromDpo',
              params: {
                dpoIdx: dpoIndex,
              },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else {
        return undefined
      }
    })
    if (filteredDpoActions) {
      const filteredActions: JSX.Element[] = filteredDpoActions.filter(
        (element: JSX.Element | undefined): element is JSX.Element => !!element
      )
      setUserActions(filteredActions)
    }
  }, [
    api,
    connected,
    dpoActions,
    dpoIndex,
    dpoInfo,
    targetDpo,
    targetTravelCabinInventory,
    targetInventoryIndex,
    newTargetIndex,
    seatsToBuy,
    estimatedFee,
    chainDecimals,
    t,
    targetTravelCabinInventoryIndex,
  ])

  return (
    <>
      {userActions &&
        userActions.length > 0 &&
        userActions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
    </>
  )
}

interface DpoActionsProps {
  dpoIndex: number | string
}

// Need to conditionally render this depending on if users have actions
export default function DpoActions(props: DpoActionsProps) {
  const { dpoIndex } = props
  const dpoInfo = useSubDpo(dpoIndex)
  const { t } = useTranslation()
  const { dpoActions } = useDpoActions(dpoInfo)
  return (
    <>
      {dpoActions && dpoActions.length > 0 && (
        <FlatCard margin="0" style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <SectionHeading>{t(`Actions`)}</SectionHeading>
          {dpoInfo && dpoIndex && <ActionProvider dpoInfo={dpoInfo} dpoIndex={dpoIndex} dpoActions={dpoActions} />}
        </FlatCard>
      )}
    </>
  )
}
