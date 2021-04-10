import { ButtonPrimary } from 'components/Button'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText } from 'components/Text'
import { Section, SpacedSection } from 'components/Wrapper'
import useTxHelpers, { CreateTxParams } from 'hooks/useTxHelpers'
import React, { useCallback, useContext, useState } from 'react'
import styled from 'styled-components'
import { ThemeContext } from 'styled-components'
import { Dispatcher } from 'types/dispatcher'

const ActionIcon = styled.img`
  max-height: 100%;
`

const ActionIconWrapper = styled.div`
  grid-area: icon;
  padding: 0.5rem;
  height: 70px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
  height: 40px;
`};
`

const ActionCard = styled.div<{ borderColor?: string }>`
  display: grid;
  grid-template-columns: minmax(60px, 80px) auto;
  grid-template-areas: 'icon text';
  grid-column-gap: 10px;
  width: 100%;
  font-size: 0.9rem;
  border: 1.5px solid ${({ theme, borderColor }) => (borderColor ? borderColor : theme.text3)};
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  grid-column-gap: 8px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  grid-template-columns: minmax(20px, 40px) auto;
  grid-column-gap: 4px;
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

interface ActionProps {
  setEstimatedFee?: Dispatcher<string | undefined>
  txContent?: JSX.Element
  actionName: string
  actionDesc?: JSX.Element
  form?: JSX.Element
  formTitle?: string
  tip?: string
  buttonText: string
  transaction: CreateTxParams
  icon?: string
}

/**
 * React Action Component
 * Transactions are created based off the transaction object.
 */
export default function Action({
  txContent,
  actionName,
  form,
  formTitle,
  tip,
  actionDesc,
  buttonText,
  transaction,
  icon,
  setEstimatedFee,
}: ActionProps) {
  const [commitDpoModalOpen, setCommitDpoModalOpen] = useState<boolean>(false)
  const [txPendingMsg, setTxPendingMsg] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [txErrorMsg, setTxErrorMsg] = useState<string>()
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false)

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

  return (
    <>
      {form && (
        <StandardModal
          title={formTitle ? formTitle : ''}
          isOpen={formModalOpen}
          onDismiss={dismissModal}
          onSubmit={handleConfirm}
          buttonText={'Confirm'}
        >
          {form}
        </StandardModal>
      )}

      <TxModal
        isOpen={commitDpoModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={actionName}
        buttonText={buttonText}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        {txContent}
      </TxModal>
      <ActionCard borderColor={theme.text5}>
        <ActionIconWrapper>
          <ActionIcon src={icon} />
        </ActionIconWrapper>
        <ActionDescription>
          <Section style={{ margin: '0px' }}>
            <RowBetween>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeavyText fontSize={'12px'}>{actionName}</HeavyText>
                {tip && <QuestionHelper text={tip} size={12} backgroundColor={'transparent'} />}
              </div>
              <ButtonPrimary
                onClick={form ? () => setFormModalOpen(!formModalOpen) : handleConfirm}
                fontSize="12px"
                style={{ paddingLeft: '1rem', paddingRight: '1rem', width: 'auto' }}
              >
                {buttonText}
              </ButtonPrimary>
            </RowBetween>
          </Section>
          {actionDesc && <SpacedSection>{actionDesc}</SpacedSection>}
        </ActionDescription>
      </ActionCard>
    </>
  )
}
