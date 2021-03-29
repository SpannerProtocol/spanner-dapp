import { StorageKey } from '@polkadot/types'
import TravelCabinCard from 'components/Item/TravelCabinCard'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useQueryTravelCabinsWithKeys } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import { TravelCabinInfo } from 'spanner-interfaces/bulletTrain'
import React from 'react'
import { useItemManager } from 'state/item/hooks'
import { useProjectManager } from 'state/project/hooks'

export default function TravelCabinCatalogue() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabinsWithIds = useQueryTravelCabinsWithKeys(projectState.selectedProject?.token).sort(
    (cabin1, cabin2) => cabin1[1].index.toNumber() - cabin2[1].index.toNumber()
  )
  const { setItem } = useItemManager()

  const handleClick = (selectedTravelCabin: [StorageKey, TravelCabinInfo]) => {
    setItem({ item: 'travelcabin', itemKey: selectedTravelCabin[0].args.toString() })
  }

  return (
    <Wrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <GridWrapper columns="2">
        {travelCabinsWithIds.map((entry, index) => {
          const travelCabinInfo = entry[1]
          const token = travelCabinInfo.token_id.isToken
            ? travelCabinInfo.token_id.asToken.toString()
            : travelCabinInfo.token_id.asDexShare.toString()
          return (
            <TravelCabinCard
              key={index}
              item={entry}
              token={token}
              chainDecimals={chainDecimals}
              onClick={handleClick}
            />
          )
        })}
      </GridWrapper>
    </Wrapper>
  )
}
