import { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { CloseIcon } from '../../../theme/components'
import { CustomLightSpinner } from '../../../theme/components'
import { AlertTriangle } from 'react-feather'
import { ButtonPrimary } from 'components/Button'
import { CenteredRow, RowBetween } from 'components/Row'
import { ModalTitle } from 'components/Text'
import { ModalWrapper, Section } from 'components/Wrapper'
import Modal from '../../../components/Modal'
import Circle from '../../../assets/images/blue-loader.svg'

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
  title: string
  buttonText: string
  content: JSX.Element
}

const Image = styled.img`
  margin: 0;
  height: 80px;
`

const ImageWrapper = styled.div`
  text-align: center;
  width: 100%;
`

// Wrap all content in <Section> tags
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
  txPending?: string | undefined
  txHash?: string
  txError?: string | undefined
  children: React.ReactNode
}

// Wrap all content in <Section> tags
export function TxModal({
  isOpen,
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

  if (txError) {
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>Error</ModalTitle>
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
            <ButtonPrimary onClick={onDismiss}>Return</ButtonPrimary>
          </Section>
        </ModalWrapper>
      </Modal>
    )
  } else if (txPending && !txHash) {
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>Tx Pending</ModalTitle>
              <CloseIcon onClick={onDismiss} />
            </RowBetween>
          </Section>
          <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <CenteredRow>
              <CustomLightSpinner src={Circle} alt="loader" size={'45px'} />
            </CenteredRow>
            <CenteredRow style={{ marginTop: '1rem', marginBottom: '1rem' }}>{txPending}</CenteredRow>
          </Section>
          <Section>
            <ButtonPrimary onClick={onConfirm} disabled>
              Please wait
            </ButtonPrimary>
          </Section>
        </ModalWrapper>
      </Modal>
    )
  } else if (!txPending && txHash) {
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>Complete</ModalTitle>
              <CloseIcon onClick={onDismiss} />
            </RowBetween>
          </Section>
          <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <CenteredRow>
              <ImageWrapper>
                <Image src={require('assets/images/complete-checkmark.png').default} />
              </ImageWrapper>
            </CenteredRow>
          </Section>
          <Section>
            <CenteredRow
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                fontWeight: 'bolder',
                textAlign: 'center',
                overflowWrap: 'anywhere',
              }}
            >
              Transaction finalized at {txHash}
            </CenteredRow>
            <CenteredRow style={{ marginTop: '1rem', marginBottom: '1rem' }}>View on Polkascan</CenteredRow>
          </Section>
          <Section>
            <RowBetween>
              <ButtonPrimary onClick={onDismiss}>Return</ButtonPrimary>
            </RowBetween>
          </Section>
        </ModalWrapper>
      </Modal>
    )
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
            <ButtonPrimary onClick={onConfirm}>{buttonText}</ButtonPrimary>
          </RowBetween>
        </Section>
      </ModalWrapper>
    </Modal>
  )
}
