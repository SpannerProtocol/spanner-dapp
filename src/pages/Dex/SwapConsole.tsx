import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { u32 } from '@polkadot/types'
import { Balance } from '@polkadot/types/interfaces'
import BN from 'bn.js'
import TxModal from 'components/Modal/TxModal'
import { CenteredRow, RowBetween } from 'components/Row'
import { DisclaimerText, ModalText } from 'components/Text'
import TxFee from 'components/TxFee'
import useSubscribeBalance from 'hooks/useQueryBalance'
import useSubscribePool from 'hooks/useQueryDexPool'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from '../../components/Button'
import Card from '../../components/Card'
import SlippageTabs from '../../components/TransactionSettings'
import { BorderedWrapper, Section } from '../../components/Wrapper'
import { useSubstrate } from '../../hooks/useSubstrate'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { formatToUnit } from '../../utils/formatUnit'
import { getSupplyAmount, getTargetAmount } from '../../utils/getSwapAmounts'
import {
  ConsoleStat,
  ErrorMsg,
  HeavyHeader,
  InputGroup,
  InputHeader,
  LightHeader,
  TokenInputAmount,
  TokenInputWrapper,
} from './components'
import TokenSelector from './components/TokenSelector'

interface SwapData {
  amountA: number
  amountB: number
  slippage: number
  displayHeader: string
  displayAmount: number
  tokenA: string
  tokenB: string
  averagePrice?: number
  estimatedFee?: string
}

function SwapModalContent({ data }: { data: SwapData }): JSX.Element {
  const { t } = useTranslation()
  const { amountA, amountB, tokenA, tokenB, slippage, averagePrice, displayHeader, displayAmount, estimatedFee } = data
  return (
    <>
      <Section>
        <CenteredRow>
          <ModalText>
            {amountA.toFixed(5)} {tokenA}
          </ModalText>
        </CenteredRow>
        <CenteredRow>
          <FontAwesomeIcon icon={faArrowDown} style={{ color: '#000', margin: '0.85rem' }} />
        </CenteredRow>
        <CenteredRow>
          <ModalText>
            {amountB.toFixed(5)} {tokenB}
          </ModalText>
        </CenteredRow>
      </Section>
      <Section>
        <CenteredRow>
          <DisclaimerText>{t(`Swap amount is estimated.`)}</DisclaimerText>
        </CenteredRow>
      </Section>
      <Section>
        <BorderedWrapper>
          <RowBetween>
            <HeavyHeader>{t(`Average Swap Price`)}</HeavyHeader>
            <ConsoleStat>
              {averagePrice?.toFixed(6)} {tokenA} / {tokenB}
            </ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>{t(`Slippage`)}</HeavyHeader>
            <ConsoleStat>{slippage / 100}%</ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>{t(displayHeader)}</HeavyHeader>
            <ConsoleStat>
              {displayAmount.toFixed(5)} {tokenB}
            </ConsoleStat>
          </RowBetween>
        </BorderedWrapper>
      </Section>
      <TxFee fee={estimatedFee} />
    </>
  )
}

export default function SwapConsole(): JSX.Element {
  const [slippage, setSlippage] = useUserSlippageTolerance()
  const { chainDecimals } = useSubstrate()
  const [tokenA, setTokenA] = useState<string>('BOLT')
  const [tokenB, setTokenB] = useState<string>('WUSD')
  const [amountA, setAmountA] = useState<number>(0)
  const [amountB, setAmountB] = useState<number>(0)
  const [isOnA, setIsOnA] = useState<boolean>(false)
  const [fromHeader, setFromHeader] = useState<string>()
  const [toHeader, setToHeader] = useState<string>()
  const [poolQueryError, setPoolQueryError] = useState<string>()
  const [pool, setPool] = useState<[Balance, Balance]>()
  const [unsafeInteger, setUnsafeInteger] = useState<boolean>(false)
  const [supplyAmount, setSupplyAmount] = useState<BN>(new BN(0))
  const [targetAmount, setTargetAmount] = useState<BN>(new BN(0))
  const [supplyAmountWithSlippage, setSupplyAmountWithSlippage] = useState<BN>(new BN(0))
  const [targetAmountWithSlippage, setTargetAmountWithSlippage] = useState<BN>(new BN(0))
  const [fee, setFee] = useState<[u32, u32]>()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { t } = useTranslation()

  const balanceA = useSubscribeBalance(tokenA)
  const balanceB = useSubscribeBalance(tokenB)

  const { pool: subscribedPool, price: subscribedPrice, dexFee: subscribedFee, error: poolError } = useSubscribePool(
    tokenA,
    tokenB,
    800
  )

  const handleAmountA = (value: number) => {
    if (!isOnA) return
    if (value > Number.MAX_SAFE_INTEGER) {
      setUnsafeInteger(true)
      return
    }
    setUnsafeInteger(false)
    setAmountA(value)
  }

  const handleAmountB = (value: number) => {
    if (isOnA) return
    if (value > Number.MAX_SAFE_INTEGER) {
      setUnsafeInteger(true)
      return
    }
    setUnsafeInteger(false)
    setAmountB(value)
  }

  const openModal = () => {
    let txData
    if (isOnA) {
      txData = createTx({
        section: 'dex',
        method: 'swapWithExactSupply',
        params: {
          path: [{ Token: tokenA }, { Token: tokenB }],
          supplyAmount: supplyAmount,
          minTargetAmount: targetAmountWithSlippage,
        },
      })
    } else {
      txData = createTx({
        section: 'dex',
        method: 'swapWithExactTarget',
        params: {
          path: [{ Token: tokenA }, { Token: tokenB }],
          target: targetAmount,
          maxSupplyAmount: supplyAmountWithSlippage,
        },
      })
    }

    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    setModalOpen(true)
  }

  // Always set slippage to .5%
  useEffect(() => {
    setSlippage(50)
  }, [setSlippage])

  // Handle Fee and Price
  useEffect(() => {
    if (poolError) {
      setPoolQueryError(poolError)
      return
    } else {
      setPoolQueryError(undefined)
    }
    if (!subscribedPool) {
      setPool(undefined)
      return
    } else {
      setPool(subscribedPool)
      if (subscribedFee) setFee(subscribedFee)
    }
  }, [subscribedPool, subscribedFee, subscribedPrice, poolError])

  // Calculate Amount B when TargetAmount changes
  useEffect(() => {
    if (targetAmount.isZero()) {
      setAmountB(0)
    } else {
      const amountWithSlippage = targetAmount.sub(targetAmount.div(new BN(10000)).mul(new BN(slippage)))
      setTargetAmountWithSlippage(amountWithSlippage)
      const targetStr = targetAmount.toString()
      if (targetStr.length > chainDecimals) {
        const number = targetStr.slice(0, targetStr.length - chainDecimals)
        const decimal = targetStr.slice(targetStr.length - chainDecimals)
        setAmountB(parseFloat(number + '.' + decimal))
      } else {
        const numberOfZeros = chainDecimals - targetStr.length
        const zeros = numberOfZeros > 0 ? '0'.repeat(numberOfZeros) : ''
        setAmountB(parseFloat('0.' + zeros + targetStr))
      }
    }
  }, [targetAmount, chainDecimals, slippage])

  // Calculate Amount A when SupplyAmount changes
  useEffect(() => {
    if (supplyAmount.isZero()) {
      setAmountA(0)
    } else {
      const amountWithSlippage = supplyAmount.add(supplyAmount.div(new BN(10000)).mul(new BN(slippage)))
      setSupplyAmountWithSlippage(amountWithSlippage)
      const supplyStr = supplyAmount.toString()
      if (supplyStr.length > chainDecimals) {
        const number = supplyStr.slice(0, supplyStr.length - chainDecimals)
        const decimal = supplyStr.slice(supplyStr.length - chainDecimals)
        setAmountA(parseFloat(number + '.' + decimal))
      } else {
        const numberOfZeros = chainDecimals - supplyStr.length
        const zeros = numberOfZeros > 0 ? '0'.repeat(numberOfZeros) : ''
        setAmountA(parseFloat('0.' + zeros + supplyStr))
      }
    }
  }, [supplyAmount, chainDecimals, slippage])

  // Calculate supplyAmount and targetAmount
  useEffect(() => {
    const cd = new BN(chainDecimals)
    if (isOnA) {
      // user provided supply
      setFromHeader(t(`From`))
      setToHeader(t(`To (estimated)`))
      if (Number.isNaN(amountA) || !pool || !fee) {
        return
      } else if (!amountA) {
        setSupplyAmount(new BN(0))
        setTargetAmount(new BN(0))
      } else {
        const [integer, decimal] = amountA.toString().split('.')
        const supply = new BN(parseFloat('0.' + decimal) * 10 ** chainDecimals).add(
          new BN(integer).mul(new BN(10).pow(cd))
        )
        setSupplyAmount(supply)
        if (supply.lte(balanceA)) {
          setTargetAmount(getTargetAmount(pool[0], pool[1], supply, fee))
        }
      }
    } else {
      // user provided target
      setFromHeader(t(`To (estimated)`))
      setToHeader(t(`To`))
      if (Number.isNaN(amountB) || !pool || !fee) {
        return
      } else if (!amountB) {
        setSupplyAmount(new BN(0))
        setTargetAmount(new BN(0))
      } else {
        const [integer, decimal] = amountB.toString().split('.')
        const target = new BN(parseFloat('0.' + decimal) * 10 ** chainDecimals).add(
          new BN(integer).mul(new BN(10).pow(cd))
        )
        setTargetAmount(target)
        setSupplyAmount(getSupplyAmount(pool[0], pool[1], target, fee))
      }
    }
  }, [isOnA, amountA, balanceA, balanceB, amountB, pool, fee, chainDecimals, t])

  const dismissModal = () => {
    setModalOpen(false)
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
  }

  return (
    <>
      <TxModal
        isOpen={modalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={'Confirm Swap'}
        buttonText={'Confirm'}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <SwapModalContent
          data={{
            amountA,
            amountB,
            tokenA,
            tokenB,
            slippage,
            averagePrice: !amountA ? 0 : amountB / amountA,
            displayHeader: isOnA ? 'Minimum Received' : 'Maximum Used',
            displayAmount: isOnA ? amountB * (1 - slippage / 10000) : amountA * (1 + slippage / 10000),
            estimatedFee: txInfo?.estimatedFee,
          }}
        />
      </TxModal>
      <Card>
        <Section>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{t(fromHeader)}</LightHeader>
                <ConsoleStat>
                  {t(`Balance`)}: {formatToUnit(balanceA, chainDecimals)}
                </ConsoleStat>
              </InputHeader>
              <TokenInputWrapper>
                <TokenInputAmount
                  required
                  id="tokena-amount-textfield"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => handleAmountA(parseFloat(e.target.value))}
                  onClick={() => {
                    setIsOnA(true)
                  }}
                  value={Number.isNaN(amountA) ? '' : amountA}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <TokenSelector
                  defaultToken={'BOLT'}
                  selectToken={(token) => {
                    setTokenA(token)
                  }}
                />
              </TokenInputWrapper>
              {supplyAmount.gt(balanceA) && <ErrorMsg>{t(`Insufficient Balance`)}</ErrorMsg>}
              {unsafeInteger && isOnA && <ErrorMsg>{t(`Amount is too high`)}</ErrorMsg>}
            </InputGroup>
          </CenteredRow>
          <CenteredRow>
            <FontAwesomeIcon icon={faArrowDown} style={{ color: '#000', margin: '0.85rem' }} />
          </CenteredRow>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{t(toHeader)}</LightHeader>
                <ConsoleStat>
                  {t(`Balance`)}: {formatToUnit(balanceB, chainDecimals)}
                </ConsoleStat>
              </InputHeader>
              <TokenInputWrapper>
                <TokenInputAmount
                  required
                  id="tokenb-amount-textfield"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => handleAmountB(parseFloat(e.target.value))}
                  onClick={() => {
                    setIsOnA(false)
                  }}
                  value={Number.isNaN(amountB) ? '' : amountB}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <TokenSelector
                  defaultToken={'WUSD'}
                  selectToken={(token) => {
                    setTokenB(token)
                  }}
                />
              </TokenInputWrapper>
              <div style={{ display: 'block' }}>
                {unsafeInteger && !isOnA && (
                  <ErrorMsg>
                    {t(`Largest Input is`)} {Number.MAX_SAFE_INTEGER}
                  </ErrorMsg>
                )}
              </div>
            </InputGroup>
          </CenteredRow>
        </Section>
        <Section>
          <SlippageTabs rawSlippage={slippage} setRawSlippage={setSlippage} />
        </Section>
        <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {poolQueryError && <ErrorMsg>{poolQueryError}</ErrorMsg>}
          <InputHeader>
            <LightHeader>{t(`Average Swap Price`)}</LightHeader>
            <ConsoleStat>
              {!amountA ? '----' : `1 ${tokenA} = ${(amountB / amountA).toFixed(4)}`} {tokenB}
            </ConsoleStat>
          </InputHeader>
        </Section>
        <Section>
          {supplyAmount.gt(balanceA) || supplyAmount.isZero() || poolQueryError || tokenA === tokenB ? (
            <ButtonPrimary disabled>{t(`Enter an amount`)}</ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={openModal}>{t(`Swap`)}</ButtonPrimary>
          )}
        </Section>
      </Card>
    </>
  )
}
