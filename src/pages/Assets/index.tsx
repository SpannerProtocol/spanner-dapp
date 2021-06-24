import { Wrapper } from 'components/Wrapper'
import React from 'react'
import TravelCabinItem from './TravelCabin'
import { usePathAssets } from 'hooks/usePath'
import { Redirect } from 'react-router-dom'

export default function Assets() {
  const assets = usePathAssets()
  return (
    <>
      <Wrapper style={{ width: '100%', maxWidth: '625px', justifyContent: 'center', alignItems: 'center' }}>
        {!assets.asset || !assets.index ? (
          <Redirect to="/assets" />
        ) : (
          <> {assets.asset === 'travelcabin' && <TravelCabinItem travelCabinIndex={assets.index} />}</>
        )}
      </Wrapper>
    </>
  )
}
