import { ButtonPrimary } from 'components/Button'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import useTxHelpers from 'hooks/useTxHelpers'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'
import { ActionProps } from '..'

const ActionCard = styled.div<{ borderColor?: string; isLast?: boolean }>`
  display: grid;
  grid-template-columns: minmax(60px, 80px) auto max(120px);
  grid-template-areas: 'icon text';
  grid-column-gap: 10px;
  width: 100%;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  border-bottom: 1.5px dotted
    ${({ theme, borderColor, isLast }) => (borderColor ? borderColor : isLast ? 'transparent' : theme.gray2)};
  align-items: center;
  margin-bottom: ${({ isLast }) => (isLast ? '0' : '1rem')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  grid-column-gap: 8px;
  `};

  ${({ isLast, theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem 0;
  grid-template-columns: minmax(20px, 30px) auto max(70px);
  grid-column-gap: 4px;
  margin-bottom: ${isLast ? '0' : '0.5rem'};
  `};
`

const ActionDescription = styled.div`
  grid-area: text;
  width: 100%;
  font-size: 1rem;
  padding: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: 0.8rem;
  `};
`

const ActionIcon = styled.img`
  max-height: 100%;
`

const ActionIconWrapper = styled.div`
  grid-area: icon;
  padding: 0.5rem;
  height: 70px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
  height: 30px;
`};
`

/**
 * React Action Component
 * Transactions are created based off the transaction object.
 */
export default function ActionRow({
  dpoInfo,
  txContent,
  actionName,
  form,
  formTitle,
  tip,
  actionDesc,
  buttonText,
  transaction,
  icon,
  gracePeriod,
  isLast,
  selectedState,
  disableButton,
  setEstimatedFee,
}: ActionProps) {
  const [commitDpoModalOpen, setCommitDpoModalOpen] = useState<boolean>(false)
  const [txPendingMsg, setTxPendingMsg] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [txErrorMsg, setTxErrorMsg] = useState<string>()
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false)
  const [isCurrent, setIscurrent] = useState<boolean>(true)
  const { t } = useTranslation()

  const { createTx, submitTx } = useTxHelpers()
  const theme = useContext(ThemeContext)

  const dismissModal = () => {
    ;[setFormModalOpen, setCommitDpoModalOpen].forEach((fn) => fn(false))
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const handleConfirm = useCallback(() => {
    form && setFormModalOpen(false)
    const txData = createTx({
      section: transaction.section,
      method: transaction.method,
      params: transaction.params,
    })
    if (txData && setEstimatedFee) {
      txData.estimatedFee.then((fee) => setEstimatedFee(fee))
    }
    setCommitDpoModalOpen(!commitDpoModalOpen)
  }, [commitDpoModalOpen, createTx, form, setEstimatedFee, transaction.method, transaction.params, transaction.section])

  useEffect(() => {
    if (!dpoInfo) return
    if (dpoInfo.state.eq(selectedState)) {
      setIscurrent(true)
    } else {
      setIscurrent(false)
    }
  }, [dpoInfo, selectedState])

  return (
    <>
      {form && (
        <StandardModal
          title={formTitle ? formTitle : ''}
          isOpen={formModalOpen}
          onDismiss={dismissModal}
          onSubmit={handleConfirm}
          buttonText={t(`Confirm`)}
        >
          {form}
        </StandardModal>
      )}

      <TxModal
        isOpen={commitDpoModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={actionName}
        buttonText={buttonText}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        {txContent}
      </TxModal>
      <ActionCard isLast={isLast}>
        <ActionIconWrapper>
          <ActionIcon src={icon} />
        </ActionIconWrapper>
        <ActionDescription>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeavyText fontSize={'12px'} width="fit-content">
              {actionName}
            </HeavyText>
            {tip && <QuestionHelper text={tip} size={12} backgroundColor={'transparent'} />}
          </div>
          {gracePeriod && isCurrent && (
            <>
              <RowFixed>
                <SText mobileFontSize="10px" width="fit-content">
                  {t(`Grace Period`)}
                </SText>
                <QuestionHelper
                  text={gracePeriod.tip}
                  size={10}
                  backgroundColor={'transparent'}
                  padding="0 0.5rem 0 0.5rem"
                />
                <SText
                  width="fit-content"
                  color={
                    gracePeriod.alert === 'safe'
                      ? theme.green1
                      : gracePeriod.alert === 'warning'
                      ? theme.yellow1
                      : theme.red1
                  }
                  mobileFontSize="10px"
                >
                  {gracePeriod.timeLeft}
                </SText>
              </RowFixed>
            </>
          )}
          {actionDesc && <>{actionDesc}</>}
        </ActionDescription>
        <ButtonPrimary
          onClick={form ? () => setFormModalOpen(!formModalOpen) : handleConfirm}
          fontSize="10px"
          mobileFontSize="10px"
          padding="0.5rem 1rem"
          mobilePadding="0.25rem 0.25rem"
          minWidth="fit-content"
          mobileMinWidth="fit-content"
          disabled={disableButton ? true : isCurrent ? false : true}
        >
          {buttonText}
        </ButtonPrimary>
      </ActionCard>
    </>
  )
}
