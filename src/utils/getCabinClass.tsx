import React from 'react'
import { TRAVELCABIN_CLASSES } from '../constants'

/**
 * Get the class name from TravelCabinInfo
 * @param cabinName TravelCabinInfo.name
 */
export default function getCabinClass(cabinName: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(cabinName)) {
    return TRAVELCABIN_CLASSES[cabinName].name
  }
  return cabinName
}

/**
 * Get the image from TravelCabinInfo
 * @param cabinName TravelCabinInfo.name
 */
export function getCabinClassImage(cabinName: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(cabinName)) {
    return (
      <div style={{ display: 'flex', maxWidth: '25px', maxHeight: '25px', marginLeft: '0.5rem' }}>
        <img
          src={TRAVELCABIN_CLASSES[cabinName].image}
          style={{ width: '100%' }}
          alt={`${TRAVELCABIN_CLASSES[cabinName].name} cabin icon`}
        />
      </div>
    )
  }
  return <></>
}

/**
 * Get the order for sorting TravelCabinInfo
 * @param cabinName TravelCabinInfo.name
 */
export function getCabinOrder(cabinName: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(cabinName)) {
    return TRAVELCABIN_CLASSES[cabinName].order
  }
  return undefined
}
