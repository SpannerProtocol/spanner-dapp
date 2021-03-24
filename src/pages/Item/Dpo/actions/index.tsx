import { FlatCardPlate } from 'components/Card'
import { BorderedInput } from 'components/Input'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { Section, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useDpoActions } from 'hooks/useDpoActions'
import { useQuerySubscribeDpo } from 'hooks/useQueryDpos'
import { useDPOTravelCabinInventoryIndex } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import getCabinClass from 'utils/getCabinClass'
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
  const { dpoActions, targetTravelCabin, targetTravelCabinInventory, targetDpo } = useDpoActions(dpoInfo)
  const [userActions, setUserActions] = useState<Array<JSX.Element>>()
  const targetInventoryIndex = useDPOTravelCabinInventoryIndex(dpoInfo.index.toString(), targetTravelCabin?.index)
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { chainDecimals } = useSubstrate()

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
                  {`Confirm Release Ticket Fare from DPO: `} {dpoInfo.index.toString()}`
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Release Ticket Fare'}
            tip={`Release Ticket Fare from DPO Vault.`}
            actionDesc={<StandardText>{`Release Ticket Fare DPO Vault.`}</StandardText>}
            icon={ACTION_ICONS[dpoAction.action]}
            buttonText={'Release'}
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
        if (!targetTravelCabinInventory) return undefined
        return (
          <Action
            txContent={
              <>
                <StandardText>
                  {`Confirm Withdraw Ticket Fare from TravelCabin: `} {dpoInfo.target.asTravelCabin.toString()}`
                </StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Withdraw Ticket Fare'}
            actionDesc={<StandardText>{`Release Ticket Fare from Target TravelCabin.`}</StandardText>}
            buttonText={'Withdraw'}
            icon={ACTION_ICONS[dpoAction.action]}
            transaction={{
              section: 'bulletTrain',
              method: 'withdrawFareFromTravelCabin',
              params: {
                travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
                travelCabinNumber: targetTravelCabinInventory[0],
              },
            }}
            setEstimatedFee={setEstimatedFee}
          />
        )
      } else if (dpoAction.action === 'dpoBuyTravelCabin') {
        // If not available, user needs to enter index of cabin that is
        return (
          <>
            {targetTravelCabinInventory && !isTravelCabinAvailable(targetTravelCabinInventory) ? (
              <Action
                txContent={
                  <>
                    <SpacedSection>
                      <StandardText>{`Confirm purchase of TravelCabin.`}</StandardText>
                    </SpacedSection>
                    <SpacedSection>
                      <RowBetween>
                        <StandardText>{`Travel Class`}</StandardText>
                        <StandardText>{getCabinClass(dpoInfo.target.asTravelCabin.toString())}</StandardText>
                      </RowBetween>
                      <RowBetween>
                        <StandardText>{`TravelCabin Id`}</StandardText>
                        <StandardText>{dpoInfo.target.asTravelCabin.toString()}</StandardText>
                      </RowBetween>
                    </SpacedSection>
                    <TxFee fee={estimatedFee} />
                  </>
                }
                actionName={'Buy TravelCabin'}
                actionDesc={<StandardText>{`Use DPO's crowdfund to buy this TravelCabin.`}</StandardText>}
                buttonText={'Buy'}
                icon={ACTION_ICONS[dpoAction.action]}
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
                          <StandardText>{`Confirm purchase of TravelCabin.`}</StandardText>
                        </SpacedSection>
                        <SpacedSection>
                          <RowBetween>
                            <StandardText>{`Travel Class`}</StandardText>
                            <StandardText>{getCabinClass(newTargetIndex)}</StandardText>
                          </RowBetween>
                          <RowBetween>
                            <StandardText>{`TravelCabin Id`}</StandardText>
                            <StandardText>{newTargetIndex}</StandardText>
                          </RowBetween>
                        </SpacedSection>
                        <TxFee fee={estimatedFee} />
                      </>
                    )}
                  </>
                }
                actionName={'Buy TravelCabin'}
                form={
                  <>
                    <StandardText>
                      {`TravelCabin: `}
                      {getCabinClass(dpoInfo.target.asTravelCabin.toString())}
                      {` is no longer available. Please enter a new TravelCabin Id to purchase.`}
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
                formTitle={'Change TravelCabin Target'}
                buttonText={'Buy'}
                icon={ACTION_ICONS[dpoAction.action]}
                tip={`Use DPO's Crowdfunded Amount to buy this TravelCabin. Leftover amount will remain in Vault`}
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
            {!isDpoAvailable(dpoInfo, targetDpo) ? (
              <Action
                txContent={
                  <>
                    <SpacedSection>
                      <StandardText>{`Confirm Purchase of DPO Seats`}</StandardText>
                    </SpacedSection>
                    <SpacedSection>
                      <RowBetween>
                        <StandardText>{`DPO Id`}</StandardText>
                        <StandardText>{dpoInfo.target.asDpo[0].toString()}</StandardText>
                      </RowBetween>
                    </SpacedSection>
                    <TxFee fee={estimatedFee} />
                  </>
                }
                actionName={'Buy DPO Seats'}
                actionDesc={
                  <StandardText>{`Use DPO's crowdfund to buy DPO ${dpoInfo.target.asDpo[0].toString()}'s Seats.`}</StandardText>
                }
                buttonText={'Buy'}
                icon={ACTION_ICONS[dpoAction.action]}
                transaction={{
                  section: 'bulletTrain',
                  method: 'dpoBuyDpoSeats',
                  params: {
                    buyerDpoIdx: dpoIndex,
                    targetDpoIdx: newTargetIndex,
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
                          <StandardText>{`Confirm Purchase of DPO Seats`}</StandardText>
                        </SpacedSection>
                        <SpacedSection>
                          <RowBetween>
                            <StandardText>{`DPO Id`}</StandardText>
                            <StandardText>{newTargetIndex}</StandardText>
                          </RowBetween>
                        </SpacedSection>
                        <TxFee fee={estimatedFee} />
                      </>
                    )}
                  </>
                }
                actionName={'Buy DPO Seats'}
                actionDesc={
                  <>
                    <SpacedSection>
                      <StandardText>
                        {`DPO ${dpoInfo.target.asDpo[0].toString()}`}
                        {` is no longer available. Please enter a new DPO Id to purchase.`}
                      </StandardText>
                    </SpacedSection>
                    <BorderedInput
                      required
                      id="dpo-index"
                      type="number"
                      placeholder="0"
                      onChange={(e) => setNewTargetIndex(e.target.value)}
                      style={{ alignItems: 'flex-end', width: '100%' }}
                    />
                    <SpacedSection>
                      <StandardText>
                        {`Please enter the number of seats from new DPO you want to purchase.`}
                      </StandardText>
                    </SpacedSection>
                    <Section>
                      <RowFixed>
                        <StandardText>{`Seats to Buy`}</StandardText>
                        <QuestionHelper
                          text={`The # of Seats you wish to buy from THIS DPO will determine the crowdfunding target of YOUR new DPO.
            The crowdfunding target will be split equally to 100 seats for your DPO members.`}
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
                buttonText={'Buy'}
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
        if (!targetTravelCabinInventory || !targetInventoryIndex || !dpoInfo.target.isTravelCabin) return undefined
        // Test this to make sure this is the correct stock index
        return (
          <Action
            txContent={
              <>
                <StandardText>{`Withdraw Yield from Cabin`}</StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Withdraw Yield from Cabin'}
            tip={`Withdraw accumulated Yield from TravelCabin to DPO vault.`}
            actionDesc={
              <>
                <StandardText>{`Withdraw accumulated Yield from TravelCabin to DPO vault.`}</StandardText>
              </>
            }
            buttonText={'Withdraw'}
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
                <StandardText>{`Confirm Release Yield rewards to Members of DPO.`}</StandardText>
                <SpacedSection>
                  <RowBetween>
                    <StandardText>{`Total Release Amount`}</StandardText>
                    <StandardText>
                      {formatToUnit(dpoInfo.vault_yield, chainDecimals, 2)} {dpoInfo.token_id.asToken.toString()}
                    </StandardText>
                  </RowBetween>
                </SpacedSection>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Release Yield to Members'}
            tip={`Release Yield Rewards from DPO Vault to Members.`}
            buttonText={'Release'}
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
                <StandardText>{`Release Drop Rewards`}</StandardText>
                <TxFee fee={estimatedFee} />
              </>
            }
            actionName={'Release Bonus Reward'}
            actionDesc={<StandardText>{`Release Bonus Reward from Bonus Vault to Members of DPO.`}</StandardText>}
            buttonText={'Release'}
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
  const dpoInfo = useQuerySubscribeDpo(dpoIndex)
  const { dpoActions } = useDpoActions(dpoInfo)
  return (
    <>
      {dpoActions && dpoActions.length > 0 && (
        <FlatCardPlate margin="0" style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <SectionHeading>Actions</SectionHeading>
          {dpoInfo && dpoIndex && <ActionProvider dpoInfo={dpoInfo} dpoIndex={dpoIndex} dpoActions={dpoActions} />}
        </FlatCardPlate>
      )}
    </>
  )
}
