import { FlatCard } from 'components/Card'
import CabinBuyerCard from 'components/Item/CabinBuyerCard'
import { DpoProfileCard } from 'components/Item/DpoCard'
import { SectionHeading, StandardText } from 'components/Text'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import { useUserDposData, useUserItems } from 'hooks/useUser'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoIndex, DpoInfo, TravelCabinIndex, TravelCabinInfo, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { useItemManager } from 'state/item/hooks'
import { DpoAction, getDpoAlerts } from 'utils/getDpoActions'
import { TravelCabinData } from 'utils/getDpoTargets'
import { getUserCabinInventoryIndexes } from 'utils/getTravelCabinBuyer'

export default function Portfolio(): JSX.Element {
  const { api, connected } = useApi()
  const wallet = useWallet()
  const userItems = useUserItems(wallet?.address)
  const [inventoryIndexes, setInventoryIndexes] = useState<[TravelCabinIndex, TravelCabinInventoryIndex][]>([])
  const { chainDecimals } = useSubstrate()
  const { setItem } = useItemManager()
  const { lastBlock } = useBlockManager()
  const dposData = useUserDposData(wallet?.address)
  const { t } = useTranslation()

  const handleDpoClick = (selectedDpo: [DpoIndex, DpoInfo]) => {
    setItem({ item: 'dpo', itemKey: selectedDpo[0].toString() })
  }

  const cabinIndexes = useMemo(() => userItems.userTravelCabins.map((cabin) => cabin[0]), [userItems.userTravelCabins])

  useEffect(() => {
    if (!connected || !wallet || cabinIndexes.length === 0) return
    cabinIndexes.forEach((cabinIndex) => {
      if (!wallet.address) return
      getUserCabinInventoryIndexes(api, cabinIndex, wallet.address).then((indexes) => setInventoryIndexes(indexes))
    })
  }, [api, cabinIndexes, connected, wallet])

  return (
    <>
      {!(wallet && wallet.address) ? (
        <>
          <FlatCard
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
            <StandardText>{t(`Connect to your wallet to view your Portfolio.`)}</StandardText>
          </FlatCard>
        </>
      ) : (
        <>
          <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {userItems?.userTravelCabins.length === 0 && userItems?.userDpos.length === 0 ? (
              <>
                <FlatCard
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
                    <Trans>
                      Could not find any Portfolio Items. Check out our <Link to="/catalogue">Growth</Link> section.
                    </Trans>
                  </StandardText>
                </FlatCard>
              </>
            ) : (
              <>
                {inventoryIndexes.length > 0 && (
                  <>
                    <SectionHeading>{t(`TravelCabins`)}</SectionHeading>
                    <GridWrapper columns="2">
                      {inventoryIndexes.map((inventory, index) => {
                        return <CabinBuyerCard key={index} cabinIndex={inventory[0]} inventoryIndex={inventory[1]} />
                      })}
                    </GridWrapper>
                  </>
                )}
                {wallet && wallet.address && userItems.userDpos.length > 0 && (
                  <>
                    <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
                      <SectionHeading>{t(`DPO`)}</SectionHeading>
                    </div>
                    <GridWrapper columns="1">
                      {userItems?.userDpos &&
                        lastBlock &&
                        wallet &&
                        Object.keys(dposData).length > 0 &&
                        userItems.userDpos.map((item, index) => {
                          const dpoInfo = item[1]
                          const token = dpoInfo.token_id.isToken
                            ? dpoInfo.token_id.asToken.toString()
                            : dpoInfo.token_id.asDexShare.toString()
                          const dpoData = dposData[dpoInfo.index.toString()]
                          let actionAlerts: Array<DpoAction | undefined> | undefined
                          if (!dpoData.target) return <div key={index}></div>
                          if (dpoInfo.target.isDpo) {
                            actionAlerts = getDpoAlerts({
                              dpoInfo,
                              lastBlock,
                              targetDpo: dpoData.target as DpoInfo,
                              walletInfo: wallet,
                            })
                          } else if (dpoInfo.target.isTravelCabin) {
                            actionAlerts = getDpoAlerts({
                              dpoInfo,
                              lastBlock,
                              targetTravelCabin: (dpoData.target as [TravelCabinInfo, TravelCabinData])[0],
                              targetTravelCabinBuyer: dpoData.targetTravelCabinBuyer,
                              targetTravelCabinInventory: dpoData.targetTravelCabinInventory,
                              walletInfo: wallet,
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
                  </>
                )}
              </>
            )}
          </Wrapper>
        </>
      )}
    </>
  )
}
