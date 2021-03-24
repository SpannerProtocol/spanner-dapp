import BN from 'bn.js'
import { ButtonPrimary } from 'components/Button'
import { FlatCard, FlatCardPlate } from 'components/Card'
import { BorderedInput } from 'components/Input'
import TxModal from 'components/Modal/TxModal'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { BorderedWrapper, ButtonWrapper, Section } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CurrencyId } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import signAndSendTx from 'utils/signAndSendTx'
import { getBurnAddr, getEthDepositAddr, postE2sCheck } from '../../bridge'

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
  const [verifiedEthDepositTx, setVerifiedEthDepositTx] = useState<Array<string | undefined> | undefined>()
  const [ethDepositAddr, setEthDepositAddr] = useState<string>()
  const [ethWithdrawAddr, setEthWithdrawAddr] = useState<string>(wallet?.ethereumAddress as string)
  const [ethWithdrawAmount, setEthWithdrawAmount] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txError, setTxErrorMsg] = useState<string | undefined>()
  const wusdBalance = useSubscribeBalance({ Token: 'WUSD' })
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!wallet || !wallet.address) return
    getEthDepositAddr(wallet.address)
      .then((response) => setEthDepositAddr(response.data))
      .catch((err) => console.log(err))
  }, [wallet])

  const handleE2sCheck = (spannerAddress: string) => {
    postE2sCheck(spannerAddress).then((response) => {
      setVerifiedEthDepositTx(typeof response.data === 'string' ? [] : response.data)
    })
  }

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
          custodialProvider: wallet.custodialProvider,
          txInfo: { section: 'currencies', method: 'transfer' },
        })
      })
    },
    [wallet, t, api, chainDecimals]
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
          <FlatCardPlate
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>{t(`Connect to your wallet to use the Bridge`)}</StandardText>
          </FlatCardPlate>
        </>
      ) : (
        <>
          <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <RowBetween>
                <SectionHeading>{t(`Spanner <-> Ethereum Bridge`)}</SectionHeading>
              </RowBetween>
            </Section>
            <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
              <Section>
                <StandardText>
                  {t(`Transfer tokens between Spanner and Ethereum. Currently only supporting WUSD <-> USDT.`)}
                </StandardText>
              </Section>
              <Section>
                <StandardText>{t(`Balances`)}</StandardText>
                <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                  <RowBetween>
                    <StandardText>{`WUSD`}</StandardText>
                    <StandardText>{formatToUnit(wusdBalance, chainDecimals, 2)}</StandardText>
                  </RowBetween>
                </BorderedWrapper>
              </Section>
            </FlatCard>
          </FlatCardPlate>

          {ethDepositAddr && wallet && (
            <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Section>
                <RowBetween>
                  <SectionHeading>{t(`Ethereum to Spanner`)}</SectionHeading>
                </RowBetween>
              </Section>
              <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
                <Section>
                  <SectionHeading>{t(`Instructions`)}</SectionHeading>
                  <StandardText>
                    <Trans>
                      The deposit address is a dedicated ethereum address generated for you. Transfer <b>USDT</b> to the
                      address and an equivalent in <b>WUSD</b> will be transferred to your custodial wallet within 5
                      minutes.
                    </Trans>
                  </StandardText>
                  <StandardText style={{ marginTop: '1rem' }}>
                    <Trans>
                      Click <b>Verify Deposit</b> to manually request a deposit verification.
                    </Trans>
                  </StandardText>
                  <Section style={{ marginTop: '2rem' }}>
                    <RowBetween>
                      <StandardText>{t(`Deposit Address`)}</StandardText>
                      <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                        {wallet.address && (
                          <ButtonPrimary
                            padding="0.45rem"
                            fontSize="12px"
                            onClick={() => handleE2sCheck(wallet.address as string)}
                          >
                            {t(`Verify Deposit`)}
                          </ButtonPrimary>
                        )}
                      </ButtonWrapper>
                    </RowBetween>
                    <BorderedWrapper style={{ marginTop: '0.5rem' }}>{ethDepositAddr}</BorderedWrapper>
                    {verifiedEthDepositTx &&
                      (verifiedEthDepositTx.length > 0 ? (
                        <>
                          <StandardText>{t(`Verification Result`)}</StandardText>
                          {verifiedEthDepositTx.map((ethDepositTx, index) => (
                            <BorderedWrapper key={index} style={{ marginTop: '0.5rem' }}>
                              {ethDepositTx}
                            </BorderedWrapper>
                          ))}
                        </>
                      ) : (
                        <>
                          <StandardText>{t(`Verification Result`)}</StandardText>
                          <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                            <StandardText>
                              {t(`Unable to find any deposit transactions. Please try again later.`)}
                            </StandardText>
                          </BorderedWrapper>
                        </>
                      ))}
                  </Section>
                </Section>
              </FlatCard>
            </FlatCardPlate>
          )}
          <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <RowBetween>
                <SectionHeading>{t(`Spanner to Ethereum`)}</SectionHeading>
              </RowBetween>
            </Section>
            <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
              <Section>
                <SectionHeading>{t(`Instructions`)}</SectionHeading>
                <StandardText>
                  {t(`Enter an address to convert and bridge your WUSD back into Ethereum USDT.`)}
                </StandardText>
                <Section style={{ marginTop: '2rem' }}>
                  <StandardText>{t(`Withdraw Amount (WUSD to USDT)`)}</StandardText>
                  <BorderedInput
                    required
                    id="eth-withdraw-amount-input"
                    type="number"
                    value={ethWithdrawAmount}
                    placeholder="0.0"
                    onChange={(e) => setEthWithdrawAmount(parseFloat(e.target.value))}
                    style={{ alignItems: 'flex-end', width: '100%', fontSize: '12px', marginTop: '0.5rem' }}
                  />
                </Section>
                <Section>
                  <StandardText>{t(`Ethereum Withdrawal Address`)}</StandardText>
                  <BorderedInput
                    required
                    id="eth-withdraw-addr-input"
                    type="string"
                    value={ethWithdrawAddr}
                    placeholder={'0x3jf9d....'}
                    onChange={(e) => setEthWithdrawAddr(e.target.value)}
                    style={{ alignItems: 'flex-end', width: '100%', fontSize: '12px', marginTop: '0.5rem' }}
                  />
                </Section>
                <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                  <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={() => setModalOpen(true)}>
                    {t(`Withdraw`)}
                  </ButtonPrimary>
                </ButtonWrapper>
              </Section>
            </FlatCard>
          </FlatCardPlate>
        </>
      )}
    </>
  )
}
