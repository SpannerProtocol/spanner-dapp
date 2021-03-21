import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import { BorderedWrapper, Section } from '../../components/Wrapper'
import { useSubstrate } from '../../hooks/useSubstrate'
import { formatToUnit } from '../../utils/formatUnit'
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
import MenuSelect from './components/MenuSelect'
import { Balance } from '@polkadot/types/interfaces'
import { getSupplyAmount, getTargetAmount } from '../../utils/getSwapAmounts'
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { BorderedInput } from '../../components/Input'

// interface SwapErrors {
//   slippage?: string
//   amountA?: string
//   amountB?: string
// }

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
              {averagePrice?.toFixed(3)} {tokenA} / {tokenB}
            </ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>{t(`Slippage`)}</HeavyHeader>
            <ConsoleStat>{slippage.toFixed(2)}%</ConsoleStat>
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
  const { chainDecimals } = useSubstrate()
  const [tokenA, setTokenA] = useState<string>('BOLT')
  const [tokenB, setTokenB] = useState<string>('WUSD')
  const [amountA, setAmountA] = useState<number>(0)
  const [amountB, setAmountB] = useState<number>(0)
  const [isOnA, setOnA] = useState<boolean>(false)
  const [fromHeader, setFromHeader] = useState<string>()
  const [toHeader, setToHeader] = useState<string>()
  const [slippage, setSlippage] = useState<number>(0.5)
  const [poolQueryError, setPoolQueryError] = useState<string>()
  const [pool, setPool] = useState<[Balance, Balance]>()
  const [price, setPrice] = useState<number>(0)
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

  const balanceA = useSubscribeBalance({ Token: tokenA })
  const balanceB = useSubscribeBalance({ Token: tokenB })

  const { pool: subscribedPool, price: subscribedPrice, dexFee: subscribedFee, error: poolError } = useSubscribePool(
    [{ Token: tokenA }, { Token: tokenB }],
    4500
  )

  const handleTokenA = (event: React.MouseEvent<HTMLElement>) => {
    const tokenName = event.currentTarget.innerText.toUpperCase()
    setTokenA(tokenName)
  }

  const handleTokenB = (event: React.MouseEvent<HTMLElement>) => {
    const tokenName = event.currentTarget.innerText.toUpperCase()
    setTokenB(tokenName)
  }

  const handleAmountA = (value: number) => {
    if (!isOnA) {
      return
    }
    setAmountA(value)
  }

  const handleAmountB = (value: number) => {
    if (isOnA) {
      return
    }
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
      setAmountA(0)
      setAmountB(0)
      if (subscribedFee) {
        setFee(subscribedFee)
      }
      if (subscribedPrice) {
        setPrice(subscribedPrice)
      }
    }
  }, [subscribedPool, subscribedFee, subscribedPrice, poolError])

  useEffect(() => {
    if (targetAmount.isZero()) {
      setAmountB(0)
    } else {
      //2 decimal place
      const amountWithSlippage = targetAmount.sub(targetAmount.div(new BN(10000)).mul(new BN(slippage * 100)))
      setTargetAmountWithSlippage(amountWithSlippage)
      const targetStr = targetAmount.toString()
      if (targetStr.length > chainDecimals) {
        const number = targetStr.slice(0, targetStr.length - chainDecimals)
        const decimal = targetStr.slice(targetStr.length - chainDecimals, targetStr.length)
        setAmountB(parseFloat(number + '.' + decimal))
      } else {
        const numberOfZeros = chainDecimals - targetStr.length
        const zeros = numberOfZeros > 0 ? '0'.repeat(numberOfZeros) : ''
        setAmountB(parseFloat('0.' + zeros + targetStr))
      }
    }
  }, [targetAmount, chainDecimals, slippage])

  useEffect(() => {
    if (supplyAmount.isZero()) {
      setAmountA(0)
    } else {
      //2 decimal place
      const amountWithSlippage = supplyAmount.add(supplyAmount.div(new BN(10000)).mul(new BN(slippage * 100)))
      setSupplyAmountWithSlippage(amountWithSlippage)
      const supplyStr = supplyAmount.toString()
      if (supplyStr.length > chainDecimals) {
        const number = supplyStr.slice(0, supplyStr.length - chainDecimals)
        const decimal = supplyStr.slice(supplyStr.length - chainDecimals, supplyStr.length)
        setAmountA(parseFloat(number + '.' + decimal))
      } else {
        const numberOfZeros = chainDecimals - supplyStr.length
        const zeros = numberOfZeros > 0 ? '0'.repeat(numberOfZeros) : ''
        setAmountA(parseFloat('0.' + zeros + supplyStr))
      }
    }
  }, [supplyAmount, chainDecimals, slippage])

  useEffect(() => {
    if (isOnA) {
      // user provided supply
      setFromHeader('From')
      setToHeader('To (estimated)')
      if (Number.isNaN(amountA) || !pool || !fee) {
        return
      } else if (!amountA) {
        setSupplyAmount(new BN(0))
        setTargetAmount(new BN(0))
      } else {
        const supply = new BN(amountA * 10 ** chainDecimals)
        setSupplyAmount(supply)
        if (supply.lte(balanceA)) {
          setTargetAmount(getTargetAmount(pool[0], pool[1], supply, fee))
        }
      }
    } else {
      // user provided target
      setFromHeader('From (estimated)')
      setToHeader('To')
      if (Number.isNaN(amountB) || !pool || !fee) {
        return
      } else if (!amountB) {
        setSupplyAmount(new BN(0))
        setTargetAmount(new BN(0))
      } else {
        const target = new BN(amountB * 10 ** chainDecimals)
        setTargetAmount(target)
        setSupplyAmount(getSupplyAmount(pool[0], pool[1], target, fee))
      }
    }
  }, [isOnA, amountA, balanceA, amountB, pool, fee, chainDecimals])

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
            displayAmount: isOnA
              ? amountB * (1 - parseFloat(slippage.toFixed(2)) / 100)
              : amountA * (1 + parseFloat(slippage.toFixed(2)) / 100),
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
                    setOnA(true)
                  }}
                  value={Number.isNaN(amountA) ? '' : amountA}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <MenuSelect items={[{ text: 'BOLT' }, { text: 'WUSD' }]} placeholder={'BOLT'} onClick={handleTokenA} />
              </TokenInputWrapper>
              {supplyAmount.gt(balanceA) && <ErrorMsg>Insufficient Balance</ErrorMsg>}
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
                    setOnA(false)
                  }}
                  value={Number.isNaN(amountB) ? '' : amountB}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <MenuSelect items={[{ text: 'BOLT' }, { text: 'WUSD' }]} placeholder={'WUSD'} onClick={handleTokenB} />
              </TokenInputWrapper>
            </InputGroup>
          </CenteredRow>
        </Section>
        <Section>
          <CenteredRow>
            <ButtonPrimary
              onClick={() => {
                setSlippage(0.1)
              }}
              margin="3px"
              padding="0.45rem"
              fontSize="12px"
            >
              {t(`0.1%`)}
            </ButtonPrimary>
            <ButtonPrimary
              onClick={() => {
                setSlippage(0.5)
              }}
              margin="3px"
              padding="0.45rem"
              fontSize="12px"
            >
              {t(`0.5%`)}
            </ButtonPrimary>
            <ButtonPrimary
              onClick={() => {
                setSlippage(1)
              }}
              margin="3px"
              padding="0.45rem"
              fontSize="12px"
            >
              {t(`1%`)}
            </ButtonPrimary>
            <BorderedInput
              required
              id="tokenb-amount-textfield"
              type="number"
              onChange={(e) => {
                setSlippage(parseFloat(e.target.value))
              }}
              value={slippage}
              style={{ margin: '3px', alignItems: 'flex-end', padding: '0.35rem', fontSize: '12px' }}
            />
          </CenteredRow>
        </Section>
        <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <InputHeader>
            <LightHeader>{t(`Current Price`)}</LightHeader>
            {!poolQueryError && price ? (
              <ConsoleStat>
                {price.toFixed(3)} {tokenA} / {tokenB}
              </ConsoleStat>
            ) : (
              <ConsoleStat> ------ </ConsoleStat>
            )}
          </InputHeader>
          {poolQueryError && <ErrorMsg>{poolQueryError}</ErrorMsg>}
          <InputHeader>
            <LightHeader>{t(`Average Swap Price`)}</LightHeader>
            <ConsoleStat>
              {!amountA ? 0 : (amountB / amountA).toFixed(3)} {tokenA} / {tokenB}
            </ConsoleStat>
          </InputHeader>
        </Section>
        <Section>
          {supplyAmount.gt(balanceA) || supplyAmount.isZero() || poolQueryError ? (
            <ButtonPrimary disabled>{t(`Enter an amount`)}</ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={openModal}>{t(`Swap`)}</ButtonPrimary>
          )}
        </Section>
      </Card>
    </>
  )
}
