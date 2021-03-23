import { useLocation } from 'react-router-dom'

interface Item {
  name: string | null
  index: string | null
}

export default function useItem(): Item {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    name: pathSplit[2],
    index: pathSplit[3],
  }
}

export function useItemCabinBuyer() {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    travelCabinIndex: pathSplit[3],
    travelCabinInventoryIndex: pathSplit[5],
  }
}
