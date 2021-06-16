import BN from 'bn.js'
import Balance from 'components/Balance'
import { ButtonPrimary } from 'components/Button'
import { BorderedInput } from 'components/Input'
import StandardModal from 'components/Modal/StandardModal'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, Section, SpacedSection } from 'components/Wrapper'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { TokenInputAmount, TokenInputWrapper } from 'pages/Dex/components'
import TokenSelector from 'pages/Dex/components/TokenSelector'
import React, { useRef, useState } from 'react'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { isValidSpannerAddress } from '../../utils/validAddress'
import { RowBetween, RowFixed } from '../Row'

const StyledMenuIcon = styled(Send)`
  height: 30px;
  width: 30px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 40px;
  background-color: ${({ theme }) => theme.bg3};
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

function ConfirmTransferContent({
  dest,
  amount,
  token,
  estimatedFee,
}: {
  dest?: string
  amount?: string
  token?: string
  estimatedFee?: string
}) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  return (
    <>
      <Section>
        <StandardText>{t(`Confirm details below. Transfers cannot be returned.`)}</StandardText>
      </Section>
      <BorderedWrapper>
        {dest && (
          <RowBetween>
            <StandardText>{t(`To`)}:</StandardText>
            <StandardText>{shortenAddr(dest, 8)}</StandardText>
          </RowBetween>
        )}
        {amount && (
          <RowBetween>
            <StandardText>{t(`Amount`)}:</StandardText>
            <StandardText>
              {formatToUnit(amount, chainDecimals, 4)} {token}
            </StandardText>
          </RowBetween>
        )}
      </BorderedWrapper>
      {token && <Balance token={token} />}
      <TxFee fee={estimatedFee} />
    </>
  )
}

interface TransferFormProps {
  onSubmit: (data: any) => void
}

function TransferForm({ onSubmit }: TransferFormProps) {
  const [amount, setAmount] = useState<number>(0)
  const [token, setToken] = useState<string>('BOLT')
  const [dest, setDest] = useState<string>()
  const [invalidDest, setInvalidDest] = useState<boolean>(true)
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const balance = useSubscribeBalance(token)

  // This is only onChange
  const handleAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (value < 0 || value > Number.MAX_SAFE_INTEGER) return
    setAmount(value)
  }

  const handleDest = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Should parse address as user types it
    isValidSpannerAddress(value) ? setInvalidDest(false) : setInvalidDest(true)
    // If user erases the entire input then revoke the error msg
    setDest(value)
  }

  const handleSubmit = () => {
    // Convert amount to string with chain decimals
    let validatedDest: null | string = null
    if (typeof dest === 'string' && isValidSpannerAddress(dest)) {
      validatedDest = dest
    }
    const amountBn = new BN(amount).mul(new BN(10).pow(new BN(chainDecimals)))
    onSubmit({ dest: validatedDest, amount: amountBn.toString(), token })
  }

  return (
    <>
      <SpacedSection>
        <RowFixed>
          <StandardText>{t(`Recipient Address`)}</StandardText>
          <QuestionHelper text={t(`The Recipient's Spanner address`)} size={12} backgroundColor={'#fff'} />
        </RowFixed>
        <BorderedInput
          required
          id="destination-address"
          type="string"
          placeholder={`e.g. 5JEJ3...i6NwF`}
          onChange={(e) => handleDest(e)}
          style={{ alignItems: 'flex-end', width: '100%' }}
        />
      </SpacedSection>
      <SpacedSection>
        <RowBetween>
          <StandardText>{t(`Amount`)}</StandardText>
          <StandardText>
            {t(`Balance`)}: {formatToUnit(balance, chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
        <TokenInputWrapper>
          <TokenInputAmount
            required
            id="token-amount-textfield"
            type="number"
            placeholder="0.0"
            onChange={(e) => handleAmount(e)}
            value={Number.isNaN(amount) ? '' : amount}
            style={{ alignItems: 'flex-start', width: '100%' }}
          />
          <TokenSelector defaultToken={token} selectToken={(selectedToken) => setToken(selectedToken)} />
        </TokenInputWrapper>
      </SpacedSection>

      <Section style={{ marginTop: '1rem' }}>
        {invalidDest ? (
          <ButtonPrimary onClick={handleSubmit} disabled>
            {t(`Invalid Spanner Address`)}
          </ButtonPrimary>
        ) : (
          <ButtonPrimary onClick={handleSubmit}>
            <Send size={16} />
            <StandardText mobileFontSize="14px" color="#fff" paddingLeft="1rem">
              {t(`Send`)}
            </StandardText>
          </ButtonPrimary>
        )}
      </Section>
    </>
  )
}

interface TransferData {
  amount?: string
  dest?: string
  token?: string
}

export default function Transfer() {
  const node = useRef<HTMLDivElement>()
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>({})
  const [transferData, setTransferData] = useState<TransferData>({})

  const dismissModal = () => {
    setModalOpen(false)
    ;[setModalOpen, setTxModalOpen].forEach((fn) => fn(false))
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  const confirmTransfer = ({ dest, amount, token }: { dest: string; amount: string; token: string }) => {
    setTransferData({
      amount,
      dest,
      token,
    })
    let txData
    if (token === 'BOLT') {
      txData = createTx({
        section: 'balances',
        method: 'transfer',
        params: { dest: dest, value: amount },
      })
    } else {
      txData = createTx({
        section: 'currencies',
        method: 'transfer',
        params: { dest: dest, currencyId: { Token: token }, amount },
      })
    }
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    setModalOpen(false)
    setTxModalOpen(true)
  }

  return (
    <>
      <StandardModal isOpen={modalOpen} title={t(`Send Funds`)} onDismiss={dismissModal} desktopScroll={true}>
        <TransferForm onSubmit={confirmTransfer} />
      </StandardModal>
      <TxModal
        isOpen={txModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={t(`Confirm Send`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <ConfirmTransferContent
          dest={transferData.dest}
          amount={transferData.amount}
          token={transferData.token}
          estimatedFee={txInfo.estimatedFee}
        />
      </TxModal>
      <StyledMenu ref={node as any}>
        <StyledMenuButton onClick={() => setModalOpen(!modalOpen)} id="open-settings-dialog-button">
          <StyledMenuIcon />
        </StyledMenuButton>
      </StyledMenu>
    </>
  )
}
