import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { createPortal } from 'react-dom'
import ApiToast from '../components/ApiToast'

interface ToastContextState {
  toast: ToastState
  toastDispatch: React.Dispatch<ToastAction>
  addToast: (newToast: ToastAction) => void
}

export const ToastContext = createContext({} as ToastContextState)

const initialState: ToastState = {}

export interface ToastState {
  title?: string
  content?: string
  jsxElement?: JSX.Element
  type?: 'success' | 'danger' | 'info' | 'warning'
}

export interface ToastAction {
  type: 'ADD' | 'UPDATE' | 'REMOVE' | 'REMOVE_ALL'
  payload: ToastState
}

export const toastReducer = (state: ToastState, action: ToastAction) => {
  switch (action.type) {
    case 'ADD':
      return {
        title: action.payload.title,
        content: action.payload.content,
        jsxElement: action.payload.jsxElement,
        type: action.payload.type ? action.payload.type : 'info',
      }
    case 'UPDATE':
      state = { ...action.payload }
      return state
    case 'REMOVE':
      return initialState
    case 'REMOVE_ALL':
      return initialState
    default:
      return state
  }
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ApiToastProvider = (props: ToastProviderProps) => {
  const [toast, toastDispatch] = useReducer(toastReducer, initialState)

  // Remove Items after certain time
  useEffect(() => {
    if (Object.keys(toast).length === 0) return
    const interval = setInterval(() => {
      // only removes notification with delay if is successful
      // for all others, we want it to remain
      if (toast.type === 'success') {
        toastDispatch({ type: 'REMOVE_ALL', payload: {} })
      }
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [toast])

  const addToast = useCallback(
    (newToast: ToastAction) => {
      toastDispatch({
        type: Object.keys(toast).length === 0 ? 'ADD' : 'UPDATE',
        payload: {
          title: newToast.payload.title,
          content: newToast.payload.content,
          jsxElement: newToast.payload.jsxElement,
          type: newToast.payload.type,
        },
      })
    },
    [toast, toastDispatch]
  )

  const toastData = useMemo(() => ({ toast, toastDispatch, addToast }), [addToast, toast])

  return (
    <ToastContext.Provider value={toastData}>
      {props.children}
      {createPortal(<ApiToast toast={toast} />, document.body)}
    </ToastContext.Provider>
  )
}

export const useApiToastContext = () => {
  return useContext(ToastContext)
}
