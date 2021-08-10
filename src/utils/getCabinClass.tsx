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
 * Get class name by TravelCabinIndex as string. Useful for target travel cabins.
 * @param cabinIndex TravelabinIndex
 * @returns class name or index if none
 */
export function getCabinClassByIndex(cabinIndex: string) {
  let cabinClassName
  Object.keys(TRAVELCABIN_CLASSES).forEach((className) => {
    if (TRAVELCABIN_CLASSES[className].order.toString() === cabinIndex) {
      cabinClassName = TRAVELCABIN_CLASSES[className].name
    }
  })
  if (cabinClassName) {
    return cabinClassName
  }
  return cabinIndex
}

/**
 * Get the image from TravelCabinInfo
 * @param cabinName TravelCabinInfo.name
 */
export function getCabinClassImage(cabinName: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(cabinName)) {
    return (
      <img
        src={TRAVELCABIN_CLASSES[cabinName].image}
        style={{ width: '100%' }}
        alt={`${TRAVELCABIN_CLASSES[cabinName].name} cabin icon`}
      />
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
