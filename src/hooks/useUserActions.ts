import { useEffect, useState } from 'react'
import { TravelCabinIndex, TravelCabinInventoryIndex } from 'spanner-api/types'
import getUserActions, { UserAction } from 'utils/getUserActions'
import { useBlockManager } from './useBlocks'
import { useSubTravelCabin, useSubTravelCabinBuyer } from './useQueryTravelCabins'
import useWallet from './useWallet'

export default function useUserActions(
  travelCabinIndex: number | string | TravelCabinIndex,
  travelCabinInventoryIndex: number | string | TravelCabinInventoryIndex
) {
  const wallet = useWallet()
  const travelCabinInfo = useSubTravelCabin(travelCabinIndex)
  const { lastBlock } = useBlockManager()
  const travelCabinBuyerInfo = useSubTravelCabinBuyer(travelCabinIndex, travelCabinInventoryIndex)
  const [actions, setActions] = useState<UserAction[]>()

  useEffect(() => {
    if (
      !wallet ||
      !wallet.address ||
      !travelCabinInventoryIndex ||
      !travelCabinInfo ||
      !travelCabinBuyerInfo ||
      !lastBlock
    )
      return
    setActions(
      getUserActions({
        travelCabinIndex,
        travelCabinInfo,
        travelCabinBuyerInfo,
        lastBlock,
        walletInfo: wallet,
      })
    )
  }, [lastBlock, travelCabinBuyerInfo, travelCabinIndex, travelCabinInfo, travelCabinInventoryIndex, wallet])

  return {
    actions,
    travelCabinIndex,
    travelCabinInfo,
    travelCabinInventoryIndex,
    travelCabinBuyerInfo,
  }
}
