import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
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
import { useWeb3Accounts } from 'hooks/useWeb3Accounts'
import { CurrencyId } from 'spanner-interfaces'
import React, { useCallback, useEffect, useState } from 'react'
import { useWalletManager } from 'state/wallet/hooks'
import { formatToUnit } from 'utils/formatUnit'
import getCustodialAccount from 'utils/getCustodialAccount'
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
  return (
    <>
      <Section>
        <StandardText>Bridge Spanner WUSD to Ethereum USDT</StandardText>
      </Section>
      {errorMsg ? (
        <Section>{errorMsg}</Section>
      ) : (
        <>
          <Section>
            <StandardText>Confirm the details below.</StandardText>
          </Section>
          <Section style={{ marginTop: '1rem' }}>
            <RowBetween>
              <StandardText>Withdraw Amount</StandardText>
              <StandardText>{withdrawAmount} WUSD</StandardText>
            </RowBetween>
            <RowBetween>
              <StandardText>Transfer to</StandardText>
              <StandardText>{withdrawAddress}</StandardText>
            </RowBetween>
          </Section>
        </>
      )}
    </>
  )
}

export default function Bridge(): JSX.Element {
  const { api } = useApi()
  const { account, library } = useWeb3React<Web3Provider>()
  const { activeAccount, injector } = useWeb3Accounts()
  const [verifiedEthDepositTx, setVerifiedEthDepositTx] = useState<Array<string | undefined> | undefined>()
  const [ethDepositAddr, setEthDepositAddr] = useState<string>()
  const [ethWithdrawAddr, setEthWithdrawAddr] = useState<string>(account as string)
  const [ethWithdrawAmount, setEthWithdrawAmount] = useState<number>(0)
  const spannerAddress = account ? getCustodialAccount(account).address : activeAccount?.address
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txError, setTxError] = useState<string | undefined>()
  const { walletState } = useWalletManager()
  const wusdBalance = useSubscribeBalance({ Token: 'WUSD' })
  const { chainDecimals } = useSubstrate()

  useEffect(() => {
    if (!spannerAddress) return
    getEthDepositAddr(spannerAddress)
      .then((response) => setEthDepositAddr(response.data))
      .catch((err) => console.log(err))
  }, [spannerAddress])

  const handleE2sCheck = (spannerAddress: string) => {
    postE2sCheck(spannerAddress).then((response) => {
      setVerifiedEthDepositTx(typeof response.data === 'string' ? [] : response.data)
    })
  }

  const withdrawToEthereum = useCallback(
    (ethWithdrawAddress: string | undefined, ethWithdrawAmount: number | undefined) => {
      if (!walletState) {
        setTxError('Please connect to a wallet.')
        return
      }
      if (!ethWithdrawAddress || !ethWithdrawAmount) {
        setTxError('Please review your withdrawal inputs.')
        return
      }
      getBurnAddr(ethWithdrawAddress).then((response) => {
        const burnAddress = response.data
        const currencyId: CurrencyId = api.createType('CurrencyId', { Token: 'WUSD' })
        const withdrawAmount = new BN(ethWithdrawAmount).mul(new BN(10 ** chainDecimals))
        const tx = api.tx.currencies.transfer(burnAddress, currencyId, withdrawAmount)
        signAndSendTx({
          tx,
          address: activeAccount ? activeAccount.address : account,
          signer: injector?.signer,
          setErrorMsg: setTxError,
          setHash: setTxHash,
          setPendingMsg: setTxPendingMsg,
          walletType: walletState.walletType,
          custodialProvider: library,
          transaction: { section: 'currencies', method: 'transfer' },
        })
      })
    },
    [account, activeAccount, api, injector, library, walletState, chainDecimals]
  )

  const dismissModal = () => {
    setModalOpen(false)
    setTxPendingMsg(undefined)
    setTxHash(undefined)
    setTxError(undefined)
  }

  return (
    <>
      <TxModal
        isOpen={modalOpen}
        onDismiss={dismissModal}
        onConfirm={() => withdrawToEthereum(ethWithdrawAddr, ethWithdrawAmount)}
        title={'Bridge to Ethereum (USDT)'}
        buttonText={'Confirm'}
        txError={txError}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <BridgeTxConfirm withdrawAmount={ethWithdrawAmount} withdrawAddress={ethWithdrawAddr} errorMsg={txError} />
      </TxModal>
      {!spannerAddress ? (
        <>
          <FlatCardPlate
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>Connect to your wallet to use the Bridge</StandardText>
          </FlatCardPlate>
        </>
      ) : (
        <>
          <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <RowBetween>
                <SectionHeading>{'Spanner <-> Ethereum Bridge'}</SectionHeading>
              </RowBetween>
            </Section>
            <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
              <Section>
                <StandardText>
                  {'Transfer tokens between Spanner and Ethereum. Currently only supporting WUSD <-> USDT.'}
                </StandardText>
              </Section>
              <Section>
                <StandardText>Balances</StandardText>
                <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                  <RowBetween>
                    <StandardText>WUSD</StandardText>
                    <StandardText>{formatToUnit(wusdBalance, chainDecimals, 2)}</StandardText>
                  </RowBetween>
                </BorderedWrapper>
              </Section>
            </FlatCard>
          </FlatCardPlate>

          {ethDepositAddr && (
            <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Section>
                <RowBetween>
                  <SectionHeading>Ethereum to Spanner</SectionHeading>
                </RowBetween>
              </Section>
              <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
                <Section>
                  <SectionHeading>Instructions</SectionHeading>
                  <StandardText>
                    The deposit address is a dedicated ethereum address generated for you. Transfer <b>USDT</b> to the
                    address and an equivalent in <b>WUSD</b> will be transferred to your custodial wallet within 5
                    minutes.
                  </StandardText>
                  <StandardText style={{ marginTop: '1rem' }}>
                    Click <b>Verify Deposit</b> to manually request a deposit verification.
                  </StandardText>
                  <Section style={{ marginTop: '2rem' }}>
                    <RowBetween>
                      <StandardText>Deposit Address</StandardText>
                      <ButtonWrapper style={{ width: '100px', margin: '0.25rem' }}>
                        <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={() => handleE2sCheck(spannerAddress)}>
                          Verify Deposit
                        </ButtonPrimary>
                      </ButtonWrapper>
                    </RowBetween>
                    <BorderedWrapper style={{ marginTop: '0.5rem' }}>{ethDepositAddr}</BorderedWrapper>
                    {verifiedEthDepositTx &&
                      (verifiedEthDepositTx.length > 0 ? (
                        <>
                          <StandardText>Verification Result</StandardText>
                          {verifiedEthDepositTx.map((ethDepositTx, index) => (
                            <BorderedWrapper key={index} style={{ marginTop: '0.5rem' }}>
                              {ethDepositTx}
                            </BorderedWrapper>
                          ))}
                        </>
                      ) : (
                        <>
                          <StandardText>Verification Result</StandardText>
                          <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                            <StandardText>
                              Unable to find any deposit transactions. Please try again later.
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
                <SectionHeading>Spanner to Ethereum</SectionHeading>
              </RowBetween>
            </Section>
            <FlatCard style={{ width: '100%', marginTop: '1rem' }}>
              <Section>
                <SectionHeading>Instructions</SectionHeading>
                <StandardText>Enter an address to convert and bridge your WUSD back into ethereum USDT.</StandardText>
                <Section style={{ marginTop: '2rem' }}>
                  <StandardText>Withdraw Amount (WUSD to USDT)</StandardText>
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
                  <StandardText>Ethereum Withdrawal Address</StandardText>
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
                    Withdraw
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
