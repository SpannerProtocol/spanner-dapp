import { TRAVELCABIN_CLASSES } from '../constants'

export default function getCabinClass(travelCabinIndex: string) {
  if (Object.keys(TRAVELCABIN_CLASSES).includes(travelCabinIndex)) {
    return TRAVELCABIN_CLASSES[travelCabinIndex]
  }
  return travelCabinIndex
}
