import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/Toast'

interface ToastContextState {
  toast: ToastState[]
  toastDispatch: React.Dispatch<ToastAction>
  queueToast: (item: ToastAction) => void
}

export const ToastContext = createContext({} as ToastContextState)

const initialState: ToastState[] = []

export interface ToastState {
  id?: number
  title?: string
  content?: string
  type?: 'success' | 'danger' | 'info' | 'warning'
  published?: boolean
}

export interface ToastAction {
  id?: number
  type: 'ADD' | 'UPDATE' | 'REMOVE' | 'REMOVE_ALL'
  payload: ToastState
}

export const toastReducer = (state: ToastState[], action: ToastAction) => {
  switch (action.type) {
    case 'ADD':
      return [
        ...state,
        {
          id: +new Date(),
          title: action.payload.title,
          content: action.payload.content,
          type: action.payload.type ? action.payload.type : 'info',
        },
      ]
    case 'UPDATE':
      const updateIndex = state.findIndex((t) => t.id === action.payload.id)
      state[updateIndex] = { ...action.payload }
      // return a copy so that it forces a rerender
      return [...state]
    case 'REMOVE':
      return state.filter((t) => t.id !== action.payload.id)
    case 'REMOVE_ALL':
      return initialState
    default:
      return state
  }
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider = (props: ToastProviderProps) => {
  const [toasts, toastDispatch] = useReducer(toastReducer, initialState)
  const [toastQueue, setToastQueue] = useState<ToastAction[]>([])

  // [id, id, id]
  // []

  const queueToast = useCallback((item: ToastAction) => {
    setToastQueue((prev) => [...prev, item])
  }, [])

  // Add queued items to dispatch, then empty queue
  useEffect(() => {
    if (toastQueue.length === 0) return
    for (let i = 0; i < toastQueue.length; i++) {
      const queued = toastQueue.pop()
      if (queued) {
        toastDispatch(queued)
      }
    }
  }, [toastQueue, toastQueue.length])

  // Remove Items after certain time
  useEffect(() => {
    if (toasts.length === 0) return
    const interval = setInterval(() => {
      if (toasts.length) {
        toastDispatch({ type: 'REMOVE', payload: { id: toasts[0].id } })
      }
    }, 8000)

    return () => {
      clearInterval(interval)
    }
  }, [toasts, toasts.length])

  const toastData = useMemo(() => ({ toast: toasts, toastDispatch, queueToast }), [queueToast, toasts])

  return (
    <ToastContext.Provider value={toastData}>
      {props.children}
      {createPortal(<Toast toast={toasts} />, document.body)}
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  return useContext(ToastContext)
}
