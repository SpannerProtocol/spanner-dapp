import { FlatCard } from 'components/Card'
import CabinBuyerCard from 'components/Item/CabinBuyerCard'
import { DpoProfileCard } from 'components/Item/DpoCard'
import { SectionHeading, StandardText } from 'components/Text'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useUserItems } from 'hooks/useUser'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-interfaces'
import { getUserCabinInventoryIndexes } from 'utils/getTravelCabinBuyer'

export default function Portfolio(): JSX.Element {
  const { api, connected } = useApi()
  const wallet = useWallet()
  const userItems = useUserItems(wallet?.address)
  const [inventoryIndexes, setInventoryIndexes] = useState<[TravelCabinIndex, TravelCabinInventoryIndex][]>([])
  const { t } = useTranslation()

  useEffect(() => {
    if (!connected || !wallet) return
    userItems.userTravelCabins.forEach((cabinInfo) => {
      if (!wallet.address) return
      getUserCabinInventoryIndexes(api, cabinInfo.index, wallet.address).then((indexes) => setInventoryIndexes(indexes))
    })
  }, [api, connected, wallet, userItems.userTravelCabins])

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
                    <SectionHeading>{t(`Your TravelCabins`)}</SectionHeading>
                    <GridWrapper columns="2">
                      {inventoryIndexes.map((inventory, index) => {
                        return <CabinBuyerCard key={index} cabinIndex={inventory[0]} inventoryIndex={inventory[1]} />
                      })}
                    </GridWrapper>
                  </>
                )}
                {userItems.userDpos.length > 0 && (
                  <>
                    <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
                      <SectionHeading>{t(`Your DPOs`)}</SectionHeading>
                    </div>
                    <GridWrapper columns="2">
                      {userItems.userDpos.map((dpo, index) => (
                        <DpoProfileCard key={index} dpoIndex={dpo.index} />
                      ))}
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
