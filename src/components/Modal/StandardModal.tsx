import { ButtonPrimary } from 'components/Button'
import { RowBetween } from 'components/Row'
import { ModalTitle } from 'components/Text'
import { ModalWrapper, Section, SpacedSection } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from 'theme/components'
import Modal from '.'

interface StandardModalProps {
  isOpen: boolean
  onDismiss: () => void
  title: string
  desktopScroll?: boolean
  onSubmit?: () => void
  buttonText?: string
  children: React.ReactNode
}

export default function StandardModal({
  isOpen,
  onDismiss,
  title,
  desktopScroll,
  children,
  onSubmit,
  buttonText,
}: StandardModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} desktopScroll={desktopScroll}>
      <ModalWrapper>
        <Section>
          <RowBetween>
            <ModalTitle>{title}</ModalTitle>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </Section>
        {children}
        {onSubmit && (
          <SpacedSection>
            <ButtonPrimary onClick={onSubmit} fontSize="12px">
              {buttonText ? buttonText : t(`Submit`)}
            </ButtonPrimary>
          </SpacedSection>
        )}
      </ModalWrapper>
    </Modal>
  )
}
