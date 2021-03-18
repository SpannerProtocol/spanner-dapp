import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { ItemState } from './reducer'
import { Item, selectItem } from './actions'

export function useItemState(): AppState['item'] {
  return useSelector<AppState, AppState['item']>((state) => state.item)
}

interface ItemManagerState {
  itemState: ItemState
  setItem: (item: Item) => void
}

export function useItemManager(): ItemManagerState {
  const itemState = useItemState()
  const dispatch = useDispatch<AppDispatch>()

  const setItem = useCallback(
    (item: Item) => {
      dispatch(selectItem({ selectedItem: item }))
    },
    [dispatch]
  )

  return { itemState, setItem }
}
