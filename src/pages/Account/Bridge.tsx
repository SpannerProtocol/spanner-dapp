import CopyHelper from 'components/Copy/Copy'
import { ButtonPrimary } from 'components/Button'
import { FlatCard } from 'components/Card'
import { BorderedInput } from 'components/Input'
import { StepNumber } from 'components/InstructionSteps'
import TxModal from 'components/Modal/TxModal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, ItalicText, SectionHeading, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, ButtonWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import useWallet from 'hooks/useWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CurrencyId } from 'spanner-interfaces'
import { useChainState, useConnectionsState } from 'state/connections/hooks'
import { shortenAddress } from 'utils'
import { formatToUnit, numberToBn } from 'utils/formatUnit'
import { getBridgeFee, getBurnAddr, getEthDepositAddr, postE2sCheck } from '../../bridge'
import { AxiosError } from 'axios'
import { useUpdateE2sTs } from 'state/user/hooks'
import moment from 'moment'
import Balance from 'components/Balance'
import BN from 'bn.js'
interface FeeData {
  feeBps: number
  feeMinUsd: number
  gasPriceGwei: number
  ethPriceUsd: number
  gasEstimateUnit: number
}

function BridgeTxConfirm({
  withdrawAmount,
  withdrawAddress,
  errorMsg,
  estimatedFee,
  feeData,
  bridgeFee,
  balanceNum,
}: {
  withdrawAmount: number
  withdrawAddress: string
  errorMsg: string | undefined
  estimatedFee?: string
  feeData?: FeeData
  bridgeFee?: number
  balanceNum?: number
}) {
  const { t } = useTranslation()

  return (
    <>
      <Section>
        <StandardText>
          {t(`Exchange Spanner WUSD for Ethereum USDT and send to Ethereum Withdrawal Address.`)}
        </StandardText>
      </Section>
      <SpacedSection>
        <ItalicText fontSize="12px">
          {t(`Please ensure Wtihdrawal Address is correct. Withdrawals to incorrect addresses cannot be returned.`)}
        </ItalicText>
      </SpacedSection>
      {errorMsg ? (
        <Section>{errorMsg}</Section>
      ) : (
        <>
          <BorderedWrapper>
            {withdrawAddress && (
              <RowBetween>
                <StandardText>{t(`Withdraw Address`)}</StandardText>
                <StandardText>{shortenAddress(withdrawAddress, 10)}</StandardText>
              </RowBetween>
            )}
            <RowBetween>
              <StandardText>{t(`Withdraw Amount`)}</StandardText>
              <StandardText>{withdrawAmount} WUSD</StandardText>
            </RowBetween>
            {feeData && bridgeFee && (
              <>
                <RowBetween>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StandardText>{t(`Bridge Fee`)}</StandardText>
                    <QuestionHelper
                      size={12}
                      backgroundColor={'transparent'}
                      text={`${t(`Minimum of`)} ${feeData.feeMinUsd} USDT`}
                    />
                  </div>
                  <StandardText>{bridgeFee} USDT</StandardText>
                </RowBetween>
                <RowBetween>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StandardText>{t(`Net Amount (est)`)}</StandardText>
                    <QuestionHelper
                      size={12}
                      backgroundColor={'transparent'}
                      text={t(`Estimated USDT transferred to provided Ethereum address after fees.`)}
                    />
                  </div>
                  <StandardText>{(withdrawAmount - bridgeFee).toFixed(4)} USDT</StandardText>
                </RowBetween>
              </>
            )}
          </BorderedWrapper>
          <Balance token={'WUSD'} />
          {bridgeFee && <TxFee fee={estimatedFee} />}
          {bridgeFee && withdrawAmount && withdrawAmount < bridgeFee && (
            <BorderedWrapper background="#F82D3A">
              <StandardText color="#fff">
                {t(`Cannot Proceed. Your Withdraw Amount cannot be lower than the Bridge Fee`)}: {bridgeFee} USDT
              </StandardText>
            </BorderedWrapper>
          )}
          {balanceNum && bridgeFee && balanceNum < bridgeFee && (
            <BorderedWrapper background="#F82D3A">
              <StandardText color="#fff">
                {t(`Cannot Proceed. Your Balance cannot be lower than the Bridge Fee`)}: {bridgeFee.toFixed(4)} USDT
              </StandardText>
            </BorderedWrapper>
          )}
          {balanceNum && withdrawAmount && balanceNum < withdrawAmount && (
            <BorderedWrapper background="#F82D3A">
              <StandardText color="#fff">
                {t(`Cannot Proceed. Your Balance cannot be lower than the Withdraw Amount`)}:{' '}
                {withdrawAmount.toFixed(4)} USDT
              </StandardText>
            </BorderedWrapper>
          )}
        </>
      )}
    </>
  )
}

export default function Bridge(): JSX.Element {
  const wallet = useWallet()
  const { api } = useApi()
  const [ethDepositAddr, setEthDepositAddr] = useState<string>()
  const [ethWithdrawAddr, setEthWithdrawAddr] = useState<string>(wallet && wallet.address ? wallet.address : '')
  const [ethWithdrawAmount, setEthWithdrawAmount] = useState<number>(0)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txError, setTxErrorMsg] = useState<string | undefined>()
  const wusdBalance = useSubscribeBalance('WUSD')
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const { createTx, submitTx } = useTxHelpers()
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false)
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const [feeData, setFeeData] = useState<FeeData>()
  const { chain } = useChainState()
  const connectionState = useConnectionsState()
  const [e2sMsg, setE2sMsg] = useState<string>()
  const [e2sTs, setE2sTs] = useUpdateE2sTs()
  const [time, setTime] = useState(Date.now())
  const [e2sTsPlus5, setE2sTsPlus5] = useState<number>(0)

  const bridge = connectionState && connectionState.bridgeServerOn

  const canE2s = useCallback(() => (time > e2sTsPlus5 ? true : false), [time, e2sTsPlus5])

  const wusdBalanceNum = useMemo(() => wusdBalance.div(new BN(10).pow(new BN(chainDecimals))).toNumber(), [
    chainDecimals,
    wusdBalance,
  ])

  useEffect(() => {
    if (!e2sTs) {
      setE2sTs()
    } else {
      setE2sTsPlus5(moment(e2sTs).add(5, 'm').valueOf())
    }
  }, [e2sTs, setE2sTs])

  // Force rerender every 1 second and store the current time
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!wallet || !wallet.address || !chain) return
    getEthDepositAddr(chain.chain, wallet.address)
      .then((response) => setEthDepositAddr(response.data))
      .catch((err) => console.log(err))
    getBridgeFee(chain.chain).then(
      (response) =>
        response.data &&
        setFeeData({
          feeBps: response.data.fee_bps,
          feeMinUsd: response.data.fee_min_usd,
          gasPriceGwei: response.data.gas_price_gwei,
          ethPriceUsd: response.data.eth_price_usd,
          gasEstimateUnit: response.data.gas_estimate_unit,
        })
    )
  }, [wallet, chain])

  const calcBridgeFee = useCallback(() => {
    if (!feeData) return
    const feeMin = feeData.feeMinUsd
    const feeBps = feeData.feeBps * 0.0001
    const feeByBps = ethWithdrawAmount * feeBps
    const fee = Math.max(feeMin, feeByBps)
    return fee
  }, [ethWithdrawAmount, feeData])

  const isTxDisabled = useCallback(() => {
    const bridgeFee = calcBridgeFee()
    if (!bridgeFee) return
    // Amount has to be greater than feeMin or user gets nothing
    if (ethWithdrawAmount < bridgeFee) {
      return true
    }
    if (wusdBalanceNum < bridgeFee) {
      return true
    }
    if (wusdBalanceNum < ethWithdrawAmount) {
      return true
    }
    return false
  }, [calcBridgeFee, ethWithdrawAmount, wusdBalanceNum])

  const withdrawToEthereum = useCallback(
    (ethWithdrawAddress: string | undefined, ethWithdrawAmount: number | undefined) => {
      if (!chain) return
      if (!wallet) {
        setTxErrorMsg(t(`Please connect to a wallet.`))
        return
      }
      if (!ethWithdrawAddress || !ethWithdrawAmount) {
        setTxErrorMsg(t(`Please review your withdrawal inputs.`))
        return
      }
      getBurnAddr(chain.chain, ethWithdrawAddress)
        .then((response) => {
          const burnAddress = response.data
          const currencyId: CurrencyId = api.createType('CurrencyId', { Token: 'WUSD' })
          const withdrawAmount = numberToBn(ethWithdrawAmount, chainDecimals)
          const txData = createTx({
            section: 'currencies',
            method: 'transfer',
            params: { dest: burnAddress, currencyId: currencyId, amount: withdrawAmount },
          })
          txData && txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
        })
        .then(() => setConfirmModalOpen(true))
    },
    [wallet, t, api, chainDecimals, createTx, chain]
  )

  const handleE2sCheck = () => {
    if (!chain || !wallet || !wallet.address) return
    postE2sCheck(chain.chain, wallet.address)
      .then((response) => {
        if (response.status === 200) {
          setE2sMsg(t(`Deposit found and is being processed. Please check your Balance in a few minutes.`))
        }
      })
      .catch((e: AxiosError) => {
        if (e.response?.status === 400) {
          setE2sMsg(t(`All transactions processed. Any questions, contact ask@spanner.network.`))
        } else {
          setE2sMsg(t(`Something unexpected Occured. Please contact ask@spanner.network.`))
        }
      })
      .finally(() => setE2sTs())
  }

  const dismissModal = () => {
    setConfirmModalOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  return (
    <>
      <TxModal
        isOpen={confirmModalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Withdraw to Ethereum (USDT)`)}
        buttonText={t(`Confirm`)}
        txError={txError}
        txHash={txHash}
        txPending={txPendingMsg}
        isDisabled={isTxDisabled()}
      >
        <BridgeTxConfirm
          withdrawAmount={ethWithdrawAmount}
          withdrawAddress={ethWithdrawAddr}
          errorMsg={txError}
          estimatedFee={txInfo?.estimatedFee}
          feeData={feeData}
          bridgeFee={calcBridgeFee()}
          balanceNum={wusdBalanceNum}
        />
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
          {!bridge ? (
            <>
              <FlatCard
                style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
              >
                <StandardText>{t(`Bridge is currently unavailable. Please check back later.`)}</StandardText>
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
                    <BorderedWrapper background="#8CD88C" borderColor="transparent">
                      <HeavyText color="#fff">{t(`Early Bird Landing Bonus`)}</HeavyText>
                      <StandardText color="#fff">
                        {t(`10 BOLT giveaway for first time deposits of at least 100 USDT.`)}
                      </StandardText>
                    </BorderedWrapper>
                  </Section>
                  <SpacedSection style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
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
                    <SpacedSection>
                      <StandardText fontSize="12px">{t(`Deposit Address (Ethereum USDT)`)}</StandardText>
                      <BorderedWrapper style={{ margin: '0' }}>
                        <CopyHelper toCopy={ethDepositAddr} childrenIsIcon={true}>
                          <StandardText>{ethDepositAddr}</StandardText>
                        </CopyHelper>
                      </BorderedWrapper>
                    </SpacedSection>
                  </SpacedSection>
                  <SpacedSection style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
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
                    <SpacedSection>
                      <StandardText fontSize="12px">{t(`Manually request a deposit check`)}</StandardText>
                      <div style={{ maxWidth: '160px', paddingTop: '0.5rem' }}>
                        {canE2s() ? (
                          <ButtonPrimary onClick={handleE2sCheck} fontSize="12px">
                            {t(`Check for Deposits`)}
                          </ButtonPrimary>
                        ) : (
                          <ButtonPrimary onClick={handleE2sCheck} fontSize="12px" disabled>
                            {`${t(`Please wait`)} ${(e2sTsPlus5 / 1000 - time / 1000).toFixed(0)} ${t(`seconds`)}`}
                          </ButtonPrimary>
                        )}
                      </div>
                    </SpacedSection>
                    {e2sMsg && !canE2s() && (
                      <BorderedWrapper background="#8CD88C" borderColor="transparent">
                        <StandardText fontSize="12px" color="#fff">
                          {e2sMsg}
                        </StandardText>
                      </BorderedWrapper>
                    )}
                  </SpacedSection>
                </FlatCard>
              )}
              <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Section>
                  <SectionHeading>{t(`Withdraw to Ethereum`)}</SectionHeading>
                  <StandardText>{t(`Exchange Spanner WUSD for Ethereum USDT.`)}</StandardText>
                </Section>
                {/* {feeData && (
                  <SpacedSection>
                    <RowBetween>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <HeavyText>{`${t(`Estimated Withdrawal Fee`)}`}</HeavyText>
                        <QuestionHelper
                          size={12}
                          backgroundColor={'transparent'}
                          text={t(
                            `The withdrawal fee is dependent on Ethereum gas fee and will vary depending on Ethereum's network congestion.`
                          )}
                        />
                      </div>
                      <StandardText>{feeData.ethPriceUsd}</StandardText>
                    </RowBetween>
                  </SpacedSection>
                )} */}
                <SpacedSection style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
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
                    value={Number.isNaN(ethWithdrawAmount) ? '' : ethWithdrawAmount}
                    placeholder="0.0"
                    onChange={(e) => setEthWithdrawAmount(parseFloat(e.target.value))}
                    style={{ alignItems: 'flex-end', width: '100%', fontSize: '12px', margin: '0' }}
                  />
                </SpacedSection>
                <SpacedSection style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
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
                  <ButtonPrimary
                    padding="0.45rem"
                    fontSize="12px"
                    onClick={() => withdrawToEthereum(ethWithdrawAddr, ethWithdrawAmount)}
                  >
                    {t(`Withdraw`)}
                  </ButtonPrimary>
                </ButtonWrapper>
              </FlatCard>
            </>
          )}
        </>
      )}
    </>
  )
}
