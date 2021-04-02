import TravelCabinCard from 'components/Item/TravelCabinCard'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useTravelCabins } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { TravelCabinIndex, TravelCabinInfo } from 'spanner-interfaces'
import { useItemManager } from 'state/item/hooks'
import { useProjectManager } from 'state/project/hooks'

export default function TravelCabinCatalogue() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabinsWithIds = useTravelCabins(projectState.selectedProject?.token)
  const { setItem } = useItemManager()

  const handleClick = (selectedTravelCabin: [TravelCabinIndex, TravelCabinInfo]) => {
    setItem({ item: 'travelcabin', itemKey: selectedTravelCabin[0].toString() })
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
