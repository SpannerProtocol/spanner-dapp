import PillToggleFilter from 'components/Filter/PillToggleFilter'
import StandardModal from 'components/Modal/StandardModal'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import React, { useCallback, useMemo, useState } from 'react'
import { DpoInfo, Target, TravelCabinInfo } from 'spanner-interfaces'
import { useTranslation } from 'translate'
import { Dispatcher } from 'types/dispatcher'
import { daysToBlocks } from 'utils/formatBlocks'
import useTheme from 'utils/useTheme'
import BuyDpoSeatsForm, { BuyDpoSeatsTxConfirm } from './BuyDpoSeats'
import BuyTravelCabinForm from './BuyTravelCabin'
import DpoTargetCabinForm, { DpoTargetCabinTxConfirm } from './CreateDpo/DpoTargetCabinForm'
import DpoTargetDpoForm, { DpoTargetDpoTxConfirm } from './CreateDpo/DpoTargetDpoForm'

export interface DpoFormCoreProps {
  setTargetType?: (data: string) => void
}

// Since DPO Creation will be an expanding product, each form section should
// a component so that it can change depending on the Target. Change Handlers should
// be passed to each form component

interface BuyAssetFormProps {
  targetType: 'DPO' | 'TravelCabin'
  buyType: 'CreateDpo' | 'Buy'
  dpoInfo?: DpoInfo
  travelCabinInfo?: TravelCabinInfo
  isOpen: boolean
  setIsOpen: Dispatcher<boolean>
}

export interface CreateDpoData {
  dpoName?: string
  targetSeats?: string
  managerSeats?: string
  baseFee?: string
  directReferralRate?: string
  end?: string
  referrer?: string | null
  newReferrer?: boolean
}

export interface BuyData {
  dpoIndex?: string
  targetSeats?: string
  referrer?: string | null
  newReferrer?: boolean
}

/**
 * BuyAssetForm handles CreateDpo (For DPO and For Cabin), PassengerBuyDpoSeats, PassengerBuyTravelCabin.
 * The Modal interface is extracted out from each form and placed in this component in order to facilitate
 * form selection.
 * @param targetType DPO | TravelCabin
 * @param buyType CreateDpo | Buy
 * @param dpoInfo DpoInfo
 * @param travelCabinInfo TravelCabinInfo
 * @param isOpen boolean to open the modal form
 * @param setIsOpen Dispatcher for setting isOpen state
 */
export default function BuyAssetForm({
  targetType,
  buyType,
  dpoInfo,
  travelCabinInfo,
  isOpen,
  setIsOpen,
}: BuyAssetFormProps) {
  const { t } = useTranslation()
  const { api, connected } = useApi()
  const [txConfirmOpen, setTxConfirmOpen] = useState<boolean>(false)
  const [createDpoData, setCreateDpoData] = useState<CreateDpoData>({})
  const [buyData, setBuyData] = useState<BuyData>({})
  const { expectedBlockTime, lastBlock } = useBlockManager()
  const [txInfo, setTxInfo] = useState<TxInfo>({})
  const [filteredBuy, setFilteredBuy] = useState<boolean>(buyType === 'Buy')
  const theme = useTheme()

  const { createTx, submitTx } = useTxHelpers()

  const handleCreateDpo = useCallback(
    ({
      dpoName,
      seats,
      managerSeats,
      baseFee,
      directReferralRate,
      end,
      referrer,
      newReferrer,
    }: {
      dpoName: string
      seats?: string
      managerSeats: string
      baseFee: number
      directReferralRate: number
      end: number
      referrer: string | null
      newReferrer: boolean
    }) => {
      if (!lastBlock || !expectedBlockTime || !connected) return

      const daysBlocks = daysToBlocks(end, expectedBlockTime)
      const endBlock = lastBlock.add(daysBlocks)
      // For
      // { TravelCabin: travelCabinInfo.index.toString() },
      // { Dpo: [dpoInfo.index.toString(), seats] },
      let target: Target
      if (targetType === 'TravelCabin' && travelCabinInfo) {
        target = api.createType('Target', { TravelCabin: travelCabinInfo.index.toString() })
      } else if (targetType === 'DPO' && dpoInfo) {
        target = api.createType('Target', { Dpo: [dpoInfo.index.toString(), seats] })
      } else {
        return
      }
      setCreateDpoData({
        dpoName,
        targetSeats: seats?.toString(),
        managerSeats: managerSeats.toString(),
        baseFee: baseFee.toString(),
        directReferralRate: directReferralRate.toString(),
        end: endBlock.toString(),
        referrer,
        newReferrer,
      })
      // baseFee and directReferralRate is per 0.1%
      const txData = createTx({
        section: 'bulletTrain',
        method: 'createDpo',
        params: {
          name: dpoName,
          target,
          managerSeats,
          baseFee: baseFee * 10,
          directReferralRate: directReferralRate * 10,
          end: endBlock.toString(),
          referrer,
        },
      })
      if (!txData) return
      txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
      setIsOpen(false)
      setTxConfirmOpen(true)
    },
    [lastBlock, expectedBlockTime, connected, targetType, travelCabinInfo, dpoInfo, createTx, setIsOpen, api]
  )

  const handleBuyDpoSeats = useCallback(
    ({ referrer, seats, newReferrer }: { referrer: string | null; seats: string; newReferrer: boolean }) => {
      if (!dpoInfo) return
      setBuyData({ dpoIndex: dpoInfo.index.toString(), targetSeats: seats, referrer, newReferrer })
      const txData = createTx({
        section: 'bulletTrain',
        method: 'passengerBuyDpoSeats',
        params: { targetDpoIdx: dpoInfo.index.toString(), numberOfSeats: seats, referrerAccount: referrer },
      })
      if (!txData) return
      txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
      setIsOpen(false)
      setTxConfirmOpen(true)
    },
    [createTx, dpoInfo, setIsOpen]
  )

  const handleBuyTravelCabin = useCallback(() => {
    if (!travelCabinInfo) return
    const txData = createTx({
      section: 'bulletTrain',
      method: 'passengerBuyTravelCabin',
      params: { travelCabinIdx: travelCabinInfo.index.toString() },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
  }, [createTx, travelCabinInfo])

  // Titles
  const title = useMemo(() => {
    if (targetType === 'DPO' && !filteredBuy) {
      return 'Create DPO For DPO'
    } else if (targetType === 'TravelCabin' && !filteredBuy) {
      return 'Create DPO For TravelCabin'
    } else if (targetType === 'DPO' && filteredBuy) {
      return 'Buy DPO Seats'
    } else if (targetType === 'TravelCabin' && filteredBuy) {
      return 'Buy TravelCabin'
    }
  }, [filteredBuy, targetType])

  return (
    <>
      <StandardModal title={t(title)} isOpen={isOpen} onDismiss={() => setIsOpen(false)} desktopScroll={true}>
        <PillToggleFilter
          isActive={filteredBuy}
          toggle={() => setFilteredBuy(!filteredBuy)}
          labelActive="Buy"
          labelInactive="Buy with DPO"
          inActiveColor={theme.white}
          inActiveBg={theme.primary1}
          buttonPadding={'0.5rem 1.5rem'}
          centered
        />
        {dpoInfo && (
          <>
            {targetType === 'DPO' && !filteredBuy && (
              <DpoTargetDpoForm
                dpoInfo={dpoInfo}
                token={dpoInfo.token_id.asToken.toString()}
                onSubmit={handleCreateDpo}
              />
            )}
            {targetType === 'DPO' && filteredBuy && (
              <BuyDpoSeatsForm
                dpoInfo={dpoInfo}
                token={dpoInfo.token_id.asToken.toString()}
                onSubmit={handleBuyDpoSeats}
              />
            )}
          </>
        )}
        {travelCabinInfo && (
          <>
            {targetType === 'TravelCabin' && !filteredBuy && (
              <DpoTargetCabinForm
                travelCabinInfo={travelCabinInfo}
                token={travelCabinInfo.token_id.asToken.toString()}
                onSubmit={handleCreateDpo}
              />
            )}
            {targetType === 'TravelCabin' && filteredBuy && (
              <BuyTravelCabinForm
                travelCabinInfo={travelCabinInfo}
                token={travelCabinInfo.token_id.asToken.toString()}
                estimatedFee={txInfo.estimatedFee}
                setIsOpen={setIsOpen}
                onRender={handleBuyTravelCabin}
                submitTx={submitTx}
              />
            )}
          </>
        )}
      </StandardModal>
      {dpoInfo && (
        <>
          {targetType === 'DPO' && !filteredBuy && (
            <DpoTargetDpoTxConfirm
              dpoInfo={dpoInfo}
              token={dpoInfo.token_id.asToken.toString()}
              isOpen={txConfirmOpen}
              setIsOpen={setTxConfirmOpen}
              txInfo={txInfo}
              createDpoData={createDpoData}
              submitTx={submitTx}
            />
          )}
          {targetType === 'DPO' && filteredBuy && (
            <BuyDpoSeatsTxConfirm
              dpoInfo={dpoInfo}
              token={dpoInfo.token_id.asToken.toString()}
              isOpen={txConfirmOpen}
              setIsOpen={setTxConfirmOpen}
              txInfo={txInfo}
              buyData={buyData}
              submitTx={submitTx}
            />
          )}
        </>
      )}
      {travelCabinInfo && (
        <>
          {targetType === 'TravelCabin' && !filteredBuy && (
            <DpoTargetCabinTxConfirm
              travelCabinInfo={travelCabinInfo}
              token={travelCabinInfo.token_id.asToken.toString()}
              isOpen={txConfirmOpen}
              setIsOpen={setTxConfirmOpen}
              txInfo={txInfo}
              createDpoData={createDpoData}
              submitTx={submitTx}
            />
          )}
        </>
      )}
    </>
  )
}
