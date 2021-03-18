import { createAction } from '@reduxjs/toolkit'

export interface Item {
  item: string
  itemKey: string
}

export const selectItem = createAction<{ selectedItem: Item }>('items/selectItem')
