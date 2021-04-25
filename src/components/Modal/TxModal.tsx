import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { CloseIcon, CustomLightSpinner } from '../../theme/components'
import { AlertTriangle } from 'react-feather'
import { ButtonPrimary } from 'components/Button'
import { CenteredRow, RowBetween } from 'components/Row'
import { HeavyText, ModalTitle, StandardText } from 'components/Text'
import { ModalWrapper, Section } from 'components/Wrapper'
import Modal from '.'
import Circle from 'assets/svg/yellow-loader.svg'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'react-feather'
import { useChainState } from 'state/connections/hooks'
import { StyledExternalLink } from 'components/Link'

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onDismiss: () => void
  title: string
  buttonText: string
  content: JSX.Element
}

const ImageWrapper = styled.div`
  text-align: center;
  width: 100%;
`

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
  const { chain } = useChainState()

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
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>{t(`Transaction Pending`)}</ModalTitle>
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
              {t(`Please wait`)}
            </ButtonPrimary>
          </Section>
        </ModalWrapper>
      </Modal>
    )
  } else if (txHash) {
    return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        <ModalWrapper>
          <Section>
            <RowBetween>
              <ModalTitle>{t(`In Block`)}</ModalTitle>
              <CloseIcon onClick={onDismiss} />
            </RowBetween>
          </Section>
          <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <CenteredRow>
              <ImageWrapper>
                <CheckCircle size={80} color={'#FFBE2E'} />
              </ImageWrapper>
            </CenteredRow>
          </Section>
          <Section>
            <CenteredRow
              style={{
                display: 'block',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                textAlign: 'center',
                overflowWrap: 'anywhere',
              }}
            >
              <StandardText style={{ margin: 'auto' }}>{t(`Transaction submitted to block at`)} </StandardText>
              <HeavyText fontSize={'14px'}>{txHash}</HeavyText>
            </CenteredRow>
            {chain && chain.url && (
              <CenteredRow style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <StyledExternalLink href={`${chain.url}/query/${txHash}`} style={{ textDecoration: 'none' }}>
                  {t(`View on Block Explorer`)}
                </StyledExternalLink>
              </CenteredRow>
            )}
          </Section>
          <Section>
            <RowBetween>
              <ButtonPrimary onClick={onDismiss}>{t(`Return`)}</ButtonPrimary>
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
