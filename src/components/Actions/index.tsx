import { CreateTxParams } from 'hooks/useTxHelpers'
import { Dispatcher } from 'types/dispatcher'
import { DpoInfo } from 'spanner-interfaces'

export * from './ActionRow'
export * from './ActionPlate'

export interface GracePeriod {
  timeLeft: string
  tip: string
  alert: 'safe' | 'warning' | 'danger'
}

export interface ActionProps {
  setEstimatedFee?: Dispatcher<string | undefined>
  txContent?: JSX.Element
  actionName: string
  actionDesc?: JSX.Element
  form?: JSX.Element
  formTitle?: string
  gracePeriod?: GracePeriod
  tip?: string
  buttonText: string
  transaction: CreateTxParams
  icon?: string
  selectedState?: string
  dpoInfo?: DpoInfo
  isLast?: boolean
  disableButton?: boolean
}
