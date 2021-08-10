import StandardModal from './StandardModal'
import { SText } from '../Text'
import { useTranslation } from 'react-i18next'

interface MaintenanceModalProps {
  isOpen: boolean
  onDismiss: () => void
  chain: string
}

export default function MaintenanceModal({ isOpen, onDismiss, chain }: MaintenanceModalProps) {
  const { t } = useTranslation()
  return (
    <StandardModal title={t(`Under maintenance`)} isOpen={isOpen} onDismiss={onDismiss} desktopScroll={true}>
      <SText padding="2rem 0.5rem">{t('Chain maintenance message', { chain: chain })}</SText>
    </StandardModal>
  )
}
