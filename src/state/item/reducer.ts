import { createReducer } from '@reduxjs/toolkit'
import { selectItem, Item } from './actions'

export interface ItemState {
  readonly selectedItem: Item | undefined
}

const initialState: ItemState = {
  selectedItem: undefined,
}

export default createReducer<ItemState>(initialState, (builder) =>
  builder.addCase(selectItem, (state, { payload: { selectedItem } }) => {
    return {
      ...state,
      selectedItem,
    }
  })
)
