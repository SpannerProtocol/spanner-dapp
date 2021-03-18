import { Wrapper } from 'components/Wrapper'
import React from 'react'
// import { useItemManager } from 'state/item/hooks'
import DpoItem from './Dpo'
import TravelCabinItem from './TravelCabin'
import useItem from 'hooks/useItem'
import { Redirect } from 'react-router-dom'

export default function Item() {
  // const { itemState } = useItemManager()
  const item = useItem()
  return (
    <>
      <Wrapper style={{ width: '100%', maxWidth: '625px', justifyContent: 'center', alignItems: 'center' }}>
        {!item.name || !item.index ? (
          <Redirect to="/catalogue" />
        ) : (
          <>
            {item.name === 'dpo' && <DpoItem dpoIndex={item.index} />}
            {item.name === 'travelcabin' && <TravelCabinItem travelCabinIndex={item.index} />}
          </>
        )}
      </Wrapper>
    </>
  )
}
