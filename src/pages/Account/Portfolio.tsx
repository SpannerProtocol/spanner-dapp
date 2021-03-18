import { FlatCardPlate } from 'components/Card'
import { DpoProfileCard } from 'components/Item/DpoCard'
import TravelCabinCard from 'components/Item/TravelCabinCard'
import { SectionHeading, StandardText } from 'components/Text'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import { useUserDposData, useUserItems } from 'hooks/useUser'
import useWallet from 'hooks/useWallet'
import { DpoIndex, DpoInfo, TravelCabinIndex, TravelCabinInfo } from 'spanner-interfaces'
import React from 'react'
import { Link } from 'react-router-dom'
import { useItemManager } from 'state/item/hooks'
import { useWalletManager } from 'state/wallet/hooks'
import { DpoAction, getDpoAlerts } from 'utils/getDpoActions'
import { TravelCabinData } from 'utils/getDpoTargets'
import Copy from '../../components/Copy/Copy'
import { useUserAddress } from '../../hooks/useUser'

export default function Portfolio(): JSX.Element {
  const walletInfo = useWallet()
  const userItems = useUserItems(walletInfo?.address)
  const { chainDecimals } = useSubstrate()
  const { setItem } = useItemManager()
  const { walletState } = useWalletManager()
  const userAddress = useUserAddress()
  const { lastBlock } = useBlockManager()
  const dposData = useUserDposData(walletInfo?.address)

  const handleDpoClick = (selectedDpo: [DpoIndex, DpoInfo]) => {
    setItem({ item: 'dpo', itemKey: selectedDpo[0].toString() })
  }

  const handleTravelCabinClick = (selectedTravelCabin: [TravelCabinIndex, TravelCabinInfo]) => {
    setItem({ item: 'travelcabin', itemKey: selectedTravelCabin[0].toString() })
  }

  return (
    <>
      {!walletState.walletType ? (
        <>
          <FlatCardPlate
            style={{
              width: '100%',
              backgroundColor: '#fff',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: '0.7rem',
              marginBottom: '0.7rem',
              textAlign: 'center',
            }}
          >
            <StandardText>Connect to your wallet to view your Portfolio.</StandardText>
          </FlatCardPlate>
        </>
      ) : (
        <>
          <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {userItems?.userTravelCabins.length === 0 && userItems?.userDpos.length === 0 ? (
              <>
                <FlatCardPlate
                  style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: '0.7rem',
                    marginBottom: '0.7rem',
                    textAlign: 'center',
                  }}
                >
                  <StandardText>
                    Could not find any Portfolio Items. Check out our <Link to="/catalogue">Growth</Link> section.
                  </StandardText>
                </FlatCardPlate>
              </>
            ) : (
              <>
                {userItems.userTravelCabins.length > 0 && (
                  <GridWrapper columns="1">
                    <SectionHeading>TravelCabins</SectionHeading>
                    {userItems?.userTravelCabins &&
                      userItems.userTravelCabins.map((item, index) => {
                        const travelCabinInfo = item[1]
                        const token = travelCabinInfo.token_id.isToken
                          ? travelCabinInfo.token_id.asToken.toString()
                          : travelCabinInfo.token_id.asDexShare.toString()
                        return (
                          <TravelCabinCard
                            key={index}
                            item={item}
                            token={token}
                            chainDecimals={chainDecimals}
                            onClick={handleTravelCabinClick}
                          />
                        )
                      })}
                  </GridWrapper>
                )}
                {userItems.userDpos.length > 0 && (
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'flex' }}>
                      <SectionHeading>DPOs</SectionHeading>
                      {userAddress && (
                        <Copy toCopy={userAddress}>
                          <span style={{ marginLeft: '4px' }}>Copy Address</span>
                        </Copy>
                      )}
                    </div>
                    <GridWrapper columns="1">
                      {userItems?.userDpos &&
                        lastBlock &&
                        walletInfo &&
                        Object.keys(dposData).length > 0 &&
                        userItems.userDpos.map((item, index) => {
                          const dpoInfo = item[1]
                          const token = dpoInfo.token_id.isToken
                            ? dpoInfo.token_id.asToken.toString()
                            : dpoInfo.token_id.asDexShare.toString()
                          const dpoData = dposData[dpoInfo.index.toString()]
                          let actionAlerts: Array<DpoAction | undefined> | undefined
                          if (!dpoData.target) return <></>
                          if (dpoInfo.target.isDpo) {
                            actionAlerts = getDpoAlerts({
                              dpoInfo,
                              lastBlock,
                              targetDpo: dpoData.target as DpoInfo,
                              walletInfo,
                            })
                          } else if (dpoInfo.target.isTravelCabin) {
                            actionAlerts = getDpoAlerts({
                              dpoInfo,
                              lastBlock,
                              targetTravelCabin: (dpoData.target as [TravelCabinInfo, TravelCabinData])[0],
                              targetTravelCabinBuyer: dpoData.targetTravelCabinBuyer,
                              targetTravelCabinInventory: dpoData.targetTravelCabinInventory,
                              walletInfo,
                            })
                          }
                          if (!actionAlerts || actionAlerts.length === 0) {
                            return (
                              <DpoProfileCard
                                key={index}
                                item={item}
                                token={token}
                                chainDecimals={chainDecimals}
                                onClick={handleDpoClick}
                              />
                            )
                          } else {
                            const filteredAlerts = actionAlerts.filter(
                              (alert) => alert && alert.dpoIndex === dpoInfo.index
                            )
                            return (
                              <>
                                {filteredAlerts && (
                                  <DpoProfileCard
                                    key={index}
                                    item={item}
                                    token={token}
                                    alerts={filteredAlerts}
                                    chainDecimals={chainDecimals}
                                    onClick={handleDpoClick}
                                  />
                                )}
                                {/* {filteredAlerts.map((filteredAlert, index) => {
                                  return (
                                    <>
                                      {filteredAlert && (
                                        <div key={index}>
                                          action: {filteredAlert.action} graceperiod:{' '}
                                          {filteredAlert.inGracePeriod?.toString()} role: {filteredAlert.role}
                                        </div>
                                      )}
                                    </>
                                  )
                                })} */}
                              </>
                            )
                          }
                        })}
                    </GridWrapper>
                  </div>
                )}
              </>
            )}
          </Wrapper>
        </>
      )}
    </>
  )
}
