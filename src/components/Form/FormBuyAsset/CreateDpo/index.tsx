import StandardModal from 'components/Modal/StandardModal'
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
  const [selectedTargetType, setTargetType] = useState<string>(targetType)
  let title = 'Create DPO'
  if (selectedTargetType === 'DPO') {
    title = 'Create DPO For DPO'
  } else if (selectedTargetType === 'TravelCabin') {
    title = 'Create DPO For TravelCabin'
  }
  return (
    <StandardModal title={t(title)} isOpen={isOpen} onDismiss={onDismiss} desktopScroll={true}>
      {selectedTargetType === 'DPO' && dpoInfo && (
        <DpoTargetDpoForm
          dpoInfo={dpoInfo}
          token={dpoInfo.token_id.asToken.toString()}
          onSubmit={onSubmit}
          setTargetType={setTargetType}
        />
      )}
      {selectedTargetType === 'TravelCabin' && travelCabinInfo && (
        <DpoTargetCabinForm
          travelCabinInfo={travelCabinInfo}
          token={travelCabinInfo.token_id.asToken.toString()}
          onSubmit={onSubmit}
          setTargetType={setTargetType}
        />
      )}
    </StandardModal>
  )
}
