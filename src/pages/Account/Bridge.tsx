import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import { FlatCard } from 'components/Card'
import { BorderedInput } from 'components/Input'
import { StepNumber } from 'components/InstructionSteps'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, SectionHeading, StandardText } from 'components/Text'
import { BorderedWrapper, ButtonWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useToastContext } from 'contexts/ToastContext'
import { useApi } from 'hooks/useApi'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CurrencyId } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import signAndSendTx from 'utils/signAndSendTx'
import { getBurnAddr, getEthDepositAddr } from '../../bridge'

function BridgeTxConfirm({
  withdrawAmount,
  withdrawAddress,
  errorMsg,
}: {
  withdrawAmount: number | undefined
  withdrawAddress: string | undefined
  errorMsg: string | undefined
}) {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <StandardText>{t(`Bridge Spanner WUSD to Ethereum USDT`)}</StandardText>
      </Section>
      {errorMsg ? (
        <Section>{errorMsg}</Section>
      ) : (
        <>
          <Section>
            <StandardText>{t(`Confirm the details below.`)}</StandardText>
          </Section>
          <Section style={{ marginTop: '1rem' }}>
            <RowBetween>
              <StandardText>{t(`Withdraw Amount`)}</StandardText>
              <StandardText>{withdrawAmount} WUSD</StandardText>
            </RowBetween>
            <RowBetween>
              <StandardText>{t(`Transfer to`)}</StandardText>
              <StandardText>{withdrawAddress}</StandardText>
            </RowBetween>
          </Section>
        </>
      )}
    </>
  )
}

export default function Bridge(): JSX.Element {
  const wallet = useWallet()
  const { api } = useApi()
  const [ethDepositAddr, setEthDepositAddr] = useState<string>()
  const [ethWithdrawAddr, setEthWithdrawAddr] = useState<string>(wallet?.ethereumAddress as string)
  const [ethWithdrawAmount, setEthWithdrawAmount] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txError, setTxErrorMsg] = useState<string | undefined>()
  const wusdBalance = useSubscribeBalance('WUSD')
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const { toastDispatch } = useToastContext()

  useEffect(() => {
    if (!wallet || !wallet.address) return
    getEthDepositAddr(wallet.address)
      .then((response) => setEthDepositAddr(response.data))
      .catch((err) => console.log(err))
  }, [wallet])

  const withdrawToEthereum = useCallback(
    (ethWithdrawAddress: string | undefined, ethWithdrawAmount: number | undefined) => {
      if (!wallet) {
        setTxErrorMsg(t(`Please connect to a wallet.`))
        return
      }
      if (!ethWithdrawAddress || !ethWithdrawAmount) {
        setTxErrorMsg(t(`Please review your withdrawal inputs.`))
        return
      }
      getBurnAddr(ethWithdrawAddress).then((response) => {
        const burnAddress = response.data
        const currencyId: CurrencyId = api.createType('CurrencyId', { Token: 'WUSD' })
        const withdrawAmount = new BN(ethWithdrawAmount).mul(new BN(10 ** chainDecimals))
        const tx = api.tx.currencies.transfer(burnAddress, currencyId, withdrawAmount)
        signAndSendTx({
          tx,
          wallet: wallet,
          setErrorMsg: setTxErrorMsg,
          setHash: setTxHash,
          setPendingMsg: setTxPendingMsg,
          toastDispatch,
          custodialProvider: wallet.custodialProvider,
          txInfo: { section: 'currencies', method: 'transfer' },
        })
      })
    },
    [wallet, t, api, chainDecimals, toastDispatch]
  )

  const dismissModal = () => {
    setModalOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  return (
    <>
      <TxModal
        isOpen={modalOpen}
        onDismiss={dismissModal}
        onConfirm={() => withdrawToEthereum(ethWithdrawAddr, ethWithdrawAmount)}
        title={t(`Bridge to Ethereum (USDT)`)}
        buttonText={t(`Confirm`)}
        txError={txError}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <BridgeTxConfirm withdrawAmount={ethWithdrawAmount} withdrawAddress={ethWithdrawAddr} errorMsg={txError} />
      </TxModal>
      {!wallet ? (
        <>
          <FlatCard
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>{t(`Connect to your wallet to use the Bridge`)}</StandardText>
          </FlatCard>
        </>
      ) : (
        <>
          <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SectionHeading style={{ margin: '0' }}>{t(`Bridge`)}</SectionHeading>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(
                    `Bridges help transfer crypto between different blockchains. Spanner's Ethereum Bridge sends your custodial wallet WUSD for the USDT (Ethereum ERC20) you send to your deposit address.`
                  )}
                />
              </div>
            </Section>
            <SpacedSection style={{ width: '100%', marginTop: '1rem' }}>
              <StandardText fontSize="12px">{t(`Balance`)}</StandardText>
              <BorderedWrapper style={{ margin: '0' }}>
                <RowBetween>
                  <StandardText>{`WUSD`}</StandardText>
                  <StandardText>{formatToUnit(wusdBalance, chainDecimals, 2)}</StandardText>
                </RowBetween>
              </BorderedWrapper>
            </SpacedSection>
          </FlatCard>

          {ethDepositAddr && wallet && (
            <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Section>
                <SectionHeading>{t(`Deposit to Spanner`)}</SectionHeading>
                <StandardText>{t(`Exchange Ethereum USDT for Spanner WUSD.`)}</StandardText>
              </Section>
              <SpacedSection>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <StepNumber size={'18px'} fontSize={'12px'}>{`1`}</StepNumber>
                  <HeavyText fontSize={'14px'}>{t(`Send USDT to this address`)}</HeavyText>
                  <QuestionHelper
                    size={12}
                    backgroundColor={'transparent'}
                    text={t(
                      `This is an Ethereum USDT deposit address. After sending USDT to this address, you will receive WUSD within 5 minutes depending on Ethereum network congestion.`
                    )}
                  />
                </div>
                <StandardText fontSize="12px">{t(`Deposit Address (Ethereum USDT)`)}</StandardText>
                <BorderedWrapper style={{ margin: '0' }}>{ethDepositAddr}</BorderedWrapper>
              </SpacedSection>
              <SpacedSection>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                  }}
                >
                  <StepNumber size={'18px'} fontSize={'12px'}>{`2`}</StepNumber>
                  <HeavyText fontSize={'14px'}>{t(`Check your WUSD balance in 5 minutes`)}</HeavyText>
                </div>
              </SpacedSection>
            </FlatCard>
          )}
          <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <SectionHeading>{t(`Withdraw to Ethereum`)}</SectionHeading>
              <StandardText>{t(`Exchange Spanner WUSD for Ethereum USDT.`)}</StandardText>
            </Section>
            <SpacedSection style={{ width: '100%', marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  paddingBottom: '0.5rem',
                }}
              >
                <StepNumber size={'18px'} fontSize={'12px'}>{`1`}</StepNumber>
                <HeavyText fontSize={'14px'}>{t(`Enter WUSD amount to withdraw`)}</HeavyText>
              </div>
              <StandardText fontSize="12px">{t(`Withdraw Amount`)}</StandardText>
              <BorderedInput
                required
                id="eth-withdraw-amount-input"
                type="number"
                value={ethWithdrawAmount}
                placeholder="0.0"
                onChange={(e) => setEthWithdrawAmount(parseFloat(e.target.value))}
                style={{ alignItems: 'flex-end', width: '100%', fontSize: '12px', margin: '0' }}
              />
            </SpacedSection>
            <SpacedSection>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  paddingBottom: '0.5rem',
                }}
              >
                <StepNumber size={'18px'} fontSize={'12px'}>{`2`}</StepNumber>
                <HeavyText fontSize={'14px'}>{t(`Enter address and click Withdraw`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(
                    `WUSD will be deducted from your Spanner wallet and USDT will be sent to your Withdrawal Address.`
                  )}
                />
              </div>
              <StandardText fontSize="12px">{t(`Withdrawal Address (Ethereum USDT)`)}</StandardText>
              <BorderedInput
                required
                id="eth-withdraw-addr-input"
                type="string"
                value={ethWithdrawAddr}
                placeholder={'0x3jf9d....'}
                onChange={(e) => setEthWithdrawAddr(e.target.value)}
                style={{ alignItems: 'flex-end', width: '100%', fontSize: '12px', margin: '0' }}
              />
            </SpacedSection>
            <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
              <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={() => setModalOpen(true)}>
                {t(`Withdraw`)}
              </ButtonPrimary>
            </ButtonWrapper>
          </FlatCard>
        </>
      )}
    </>
  )
}
