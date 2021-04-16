import { useLocation } from 'react-router-dom'

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