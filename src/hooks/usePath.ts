import { useLocation } from 'react-router-dom'

interface Asset {
  asset: string
  index: string
}

export function usePathAssets(): Asset {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    asset: pathSplit[2],
    index: pathSplit[3],
  }
}

export function usePathCabinBuyer() {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    travelCabinIndex: pathSplit[3],
    travelCabinInventoryIndex: pathSplit[5],
  }
}

export function useBulletTrain() {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    item: pathSplit[2],
  }
}

export function useAccount() {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    item: pathSplit[2],
  }
}

export function usePathDpoInfoTab() {
  // item/dpo/{dpoIndex}/tab
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    dpoIndex: pathSplit[3],
    section: pathSplit[4],
  }
}
