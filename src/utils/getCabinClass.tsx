import { TRAVELCABIN_CLASSES } from '../constants'
import React from 'react'

export default function getCabinClass(travelCabinIndex: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(travelCabinIndex)) {
    return TRAVELCABIN_CLASSES[travelCabinIndex].name
  }
  return travelCabinIndex
}

export function getCabinClassImage(travelCabinIndex: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(travelCabinIndex)) {
    return (
      <div style={{ display: 'flex', maxWidth: '25px', maxHeight: '25px', marginLeft: '0.5rem' }}>
        <img
          src={TRAVELCABIN_CLASSES[travelCabinIndex].image}
          style={{ width: '100%' }}
          alt={`${TRAVELCABIN_CLASSES[travelCabinIndex].name} cabin icon`}
        />
      </div>
    )
  }
  return <></>
}
