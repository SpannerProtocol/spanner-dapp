import { ButtonPrimary } from 'components/Button'
import { CenteredRow, RowBetween } from 'components/Row'
import { ModalTitle } from 'components/Text'
import { ModalWrapper, Section } from 'components/Wrapper'
import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import Modal from '.'
import { CloseIcon } from '../../theme/components'

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
  title: string
  buttonText: string
  content: JSX.Element
}

// const ImageWrapper = styled.div`
//   text-align: center;
//   width: 100%;
// `

export function ConfirmModal({ isOpen, onDismiss, onConfirm, title, buttonText, content }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ModalWrapper>
        <Section>
          <RowBetween>
            <ModalTitle>{title}</ModalTitle>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </Section>
        {content}
        <Section>
          <RowBetween>
            <ButtonPrimary onClick={onConfirm}>{buttonText}</ButtonPrimary>
          </RowBetween>
        </Section>
      </ModalWrapper>
    </Modal>
  )
}

interface TxModalProps {
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
  title: string
  buttonText: string
  isDisabled?: boolean
  txPending?: string | undefined
  txHash?: string
  txError?: string | undefined
  children: React.ReactNode
}

export default function TxModal({
  isOpen,
  isDisabled,
  onDismiss,
  onConfirm,
  title,
  buttonText,
  txPending,
  txHash,
  txError,
  children,
}: TxModalProps) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()

  if (txError) {
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>{t(`Error`)}</ModalTitle>
              <CloseIcon onClick={onDismiss} />
            </RowBetween>
          </Section>
          <Section>
            <CenteredRow>
              <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            </CenteredRow>
            <CenteredRow>{txError}</CenteredRow>
          </Section>
          <Section>
            <ButtonPrimary onClick={onDismiss}>{t(`Return`)}</ButtonPrimary>
          </Section>
        </ModalWrapper>
      </Modal>
    )
  } else if (txPending && !txHash) {
    return null
  }
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ModalWrapper>
        <Section>
          <RowBetween>
            <ModalTitle>{title}</ModalTitle>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </Section>
        {children}
        <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <RowBetween>
            {isDisabled ? (
              <ButtonPrimary onClick={onConfirm} disabled>
                {buttonText}
              </ButtonPrimary>
            ) : (
              <ButtonPrimary onClick={onConfirm}>{buttonText}</ButtonPrimary>
            )}
          </RowBetween>
        </Section>
      </ModalWrapper>
    </Modal>
  )
}
