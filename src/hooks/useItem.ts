import { useLocation } from 'react-router-dom'

interface Item {
  name: string | null
  index: string | null
  referrer: string | null
}

export default function useItem(): Item {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const pathnameSplit = location.pathname.split('/')
  return {
    name: pathnameSplit[2],
    index: pathnameSplit[3],
    referrer: search.get('ref'),
  }
}
