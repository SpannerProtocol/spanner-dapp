import { useLocation } from 'react-router-dom'

interface Project {
  token: string
}

export default function useProject(): Project {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  return {
    token: pathSplit[2],
  }
}
