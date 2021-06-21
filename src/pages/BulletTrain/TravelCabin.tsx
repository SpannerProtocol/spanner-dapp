import TravelCabinCard from 'components/AssetCards/TravelCabinCard'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import { useTravelCabins } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useMemo } from 'react'
import { useProjectManager } from 'state/project/hooks'
import { getCabinOrder } from 'utils/getCabinClass'

export default function TravelCabinCatalogue() {
  const { projectState } = useProjectManager()
  const { chainDecimals } = useSubstrate()
  const travelCabins = useTravelCabins(projectState.selectedProject?.token)

  const sortedCabins = useMemo(
    () => travelCabins.sort((t1, t2) => getCabinOrder(t1[1].name.toString()) - getCabinOrder(t2[1].name.toString())),
    [travelCabins]
  )

  return (
    <Wrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <GridWrapper columns="2">
        {sortedCabins.map((entry, index) => {
          const travelCabinInfo = entry[1]
          const token = travelCabinInfo.token_id.isToken
            ? travelCabinInfo.token_id.asToken.toString()
            : travelCabinInfo.token_id.asDexShare.toString()
          return <TravelCabinCard key={index} item={entry[1]} token={token} chainDecimals={chainDecimals} />
        })}
      </GridWrapper>
    </Wrapper>
  )
}
