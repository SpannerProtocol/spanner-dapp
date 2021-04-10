import React, { createContext, useReducer, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/Toast'

interface ToastContextState {
  toast: ToastState[]
  toastDispatch: React.Dispatch<ToastAction>
}

export const ToastContext = createContext({} as ToastContextState)

const initialState: ToastState[] = []

export interface ToastState {
  id?: number
  title?: string
  content?: string
  type?: 'success' | 'danger' | 'info' | 'warning'
}

export interface ToastAction {
  type: 'ADD' | 'REMOVE' | 'REMOVE_ALL'
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
  const [toast, toastDispatch] = useReducer(toastReducer, initialState)
  const toastData = { toast, toastDispatch }

  useEffect(() => {
    if (toast.length === 0) return
    const interval = setInterval(() => {
      if (toast.length) {
        toastDispatch({ type: 'REMOVE', payload: { id: toast[0].id } })
      }
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [toast])

  return (
    <ToastContext.Provider value={toastData}>
      {props.children}

      {createPortal(<Toast toast={toast} />, document.body)}
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  return useContext(ToastContext)
}
