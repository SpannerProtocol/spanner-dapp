import StandardModal from 'components/Modal/StandardModal'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo, TravelCabinInfo } from 'spanner-interfaces'
import DpoTargetCabinForm from './DpoTargetCabinForm'
import DpoTargetDpoForm from './DpoTargetDpoForm'

export interface DpoFormCoreProps {
  setTargetType?: (data: string) => void
}

// Since DPO Creation will be an expanding product, each form section should
// a component so that it can change depending on the Target. Change Handlers should
// be passed to each form component

interface DpoModalFormProps {
  targetType: 'DPO' | 'TravelCabin'
  dpoInfo?: DpoInfo
  travelCabinInfo?: TravelCabinInfo
  isOpen: boolean
  onDismiss: () => void
  onSubmit: (data: any) => void
}

export default function DpoModalForm({
  targetType,
  dpoInfo,
  travelCabinInfo,
  isOpen,
  onDismiss,
  onSubmit,
}: DpoModalFormProps) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const [selectedTargetType, setTargetType] = useState<string>(targetType)
  return (
    <StandardModal title={t(`Create DPO`)} isOpen={isOpen} onDismiss={onDismiss} desktopScroll={true}>
      {selectedTargetType === 'DPO' && dpoInfo && (
        <DpoTargetDpoForm
          dpoInfo={dpoInfo}
          token={dpoInfo.token_id.asToken.toString()}
          chainDecimals={chainDecimals}
          onSubmit={onSubmit}
          setTargetType={setTargetType}
        />
      )}
      {selectedTargetType === 'TravelCabin' && travelCabinInfo && (
        <DpoTargetCabinForm
          travelCabinInfo={travelCabinInfo}
          token={travelCabinInfo.token_id.asToken.toString()}
          chainDecimals={chainDecimals}
          onSubmit={onSubmit}
          setTargetType={setTargetType}
        />
      )}
    </StandardModal>
  )
}
