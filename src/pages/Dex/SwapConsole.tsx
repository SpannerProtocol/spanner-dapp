import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Divider from '@material-ui/core/Divider'
import TxModal from 'components/Modal/TxModal'
import { CenteredRow, RowBetween } from 'components/Row'
import { DisclaimerText, ModalText } from 'components/Text'
import TxFee from 'components/TxFee'
import useSubscribeBalance from 'hooks/useQueryBalance'
import useSubscribePool from 'hooks/useQueryDexPrice'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import React, { useEffect, useState } from 'react'
import { ButtonPrimary } from '../../components/Button'
import Card from '../../components/Card'
import { BorderedInput } from '../../components/Input'
import { BorderedWrapper, Section } from '../../components/Wrapper'
import { useSubstrate } from '../../hooks/useSubstrate'
import { formatToUnit, unitToBn } from '../../utils/formatUnit'
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

interface SwapErrors {
  slippage?: string
  amountA?: string
  amountB?: string
}

interface SwapData {
  amountA: number
  amountB: number
  tokenA: string
  tokenB: string
  slippage: number
  price?: number
  estimatedFee?: string
}

function SwapModalContent({ data }: { data: SwapData }): JSX.Element {
  const { amountA, amountB, tokenA, tokenB, price, slippage, estimatedFee } = data
  const minReceived = amountB - slippage * amountB
  return (
    <>
      <Section>
        <CenteredRow>
          <ModalText>
            {amountA} {tokenA}
          </ModalText>
        </CenteredRow>
        <CenteredRow>
          <FontAwesomeIcon icon={faArrowDown} style={{ color: '#000', margin: '0.85rem' }} />
        </CenteredRow>
        <CenteredRow>
          <ModalText>
            {amountB} {tokenB}
          </ModalText>
        </CenteredRow>
      </Section>
      <Section>
        <CenteredRow>
          <DisclaimerText>{`Swap amount is estimated.`}</DisclaimerText>
        </CenteredRow>
      </Section>
      <Section>
        <BorderedWrapper>
          <RowBetween>
            <HeavyHeader>{`Price`}</HeavyHeader>
            <ConsoleStat>
              {price} {tokenA} / {tokenB}
            </ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>{`Minimum received`}</HeavyHeader>
            <ConsoleStat>
              {minReceived.toFixed(4)} {tokenB}
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
  const [slippage, setSlippage] = useState<number>(0)
  const [errors, setErrors] = useState<SwapErrors>({})
  const [priceQueryError, setPriceQueryError] = useState<string>()
  const [price, setPrice] = useState<number>()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()

  const balanceA = useSubscribeBalance({ Token: tokenA })
  const balanceB = useSubscribeBalance({ Token: tokenB })

  const { price: subscribedPrice, error: priceError } = useSubscribePool([{ Token: tokenA }, { Token: tokenB }], 4500)

  const handleTokenA = (event: React.MouseEvent<HTMLElement>) => {
    const tokenName = event.currentTarget.innerText.toUpperCase()
    setTokenA(tokenName)
  }

  const handleTokenB = (event: React.MouseEvent<HTMLElement>) => {
    const tokenName = event.currentTarget.innerText.toUpperCase()
    setTokenB(tokenName)
  }

  const handleAmountA = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (unitToBn(value, chainDecimals) > balanceA) {
      setErrors({ ...errors, amountA: 'Amount cannot exceed balance' })
      return
    }
    setErrors({ ...errors, amountA: undefined })
    setAmountA(value)
  }

  const handleAmountB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setErrors({ ...errors, amountB: undefined })
    setAmountB(value)
  }

  const handleSlippage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const re = /^(?:0*(?:\.\d+)?|1(\.0*)?)$/
    if (value === '' || re.test(value)) {
      let tolerance = parseFloat(value)
      tolerance = Number.isNaN(tolerance) ? 0 : tolerance
      setErrors({ ...errors, slippage: undefined })
      setSlippage(tolerance)
    } else {
      setErrors({ ...errors, slippage: 'Should be a decimal between 0 - 1' })
    }
  }

  const openModal = () => {
    const txData = createTx({
      section: 'dex',
      method: 'swapWithExactSupply',
      params: {
        path: [{ Token: tokenA }, { Token: tokenB }],
        supplyAmount: unitToBn(amountA, chainDecimals).toString(),
        minTargetAmount: unitToBn(amountB, chainDecimals)
          .sub(unitToBn(slippage * amountB, chainDecimals))
          .toString(),
      },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    setModalOpen(true)
  }

  useEffect(() => {
    if (priceError) {
      setPriceQueryError(priceError)
      return
    } else {
      setPriceQueryError(undefined)
    }
    if (!subscribedPrice) {
      setPrice(undefined)
      return
    } else {
      setPrice(subscribedPrice)
    }
  }, [subscribedPrice, priceError])

  useEffect(() => {
    if (!price || Number.isNaN(price)) return
    if (Number.isNaN(amountA)) {
      setAmountB(0)
      return
    }
    const estimatedBPrice = price * amountA
    setAmountB(estimatedBPrice)
  }, [price, amountA])

  const dismissModal = () => {
    setModalOpen(false)
    setTxPendingMsg(undefined)
    setTxHash(undefined)
    setTxErrorMsg(undefined)
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
          data={{ amountA, amountB, tokenA, tokenB, price, slippage, estimatedFee: txInfo?.estimatedFee }}
        />
      </TxModal>
      <Card>
        <Section>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{`From`}</LightHeader>
                <ConsoleStat>
                  {`Balance:`} {formatToUnit(balanceA, chainDecimals)}
                </ConsoleStat>
              </InputHeader>
              <TokenInputWrapper>
                <TokenInputAmount
                  required
                  id="tokena-amount-textfield"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => handleAmountA(e)}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <MenuSelect items={[{ text: 'BOLT' }, { text: 'WUSD' }]} placeholder={'BOLT'} onClick={handleTokenA} />
              </TokenInputWrapper>
              {errors.amountA && <ErrorMsg>{errors.amountA}</ErrorMsg>}
            </InputGroup>
          </CenteredRow>
          <CenteredRow>
            <FontAwesomeIcon icon={faArrowDown} style={{ color: '#000', margin: '0.85rem' }} />
          </CenteredRow>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{`To (estimated)`}</LightHeader>
                <ConsoleStat>
                  {`Balance:`} {formatToUnit(balanceB, chainDecimals)}
                </ConsoleStat>
              </InputHeader>
              <TokenInputWrapper>
                <TokenInputAmount
                  required
                  id="tokenb-amount-textfield"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => handleAmountB(e)}
                  value={amountB}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <MenuSelect items={[{ text: 'BOLT' }, { text: 'WUSD' }]} placeholder={'WUSD'} onClick={handleTokenB} />
              </TokenInputWrapper>
              {errors.amountB && <ErrorMsg>{errors.amountB}</ErrorMsg>}
            </InputGroup>
          </CenteredRow>
        </Section>
        <Divider variant="middle" style={{ margin: '1rem 0 1rem 0' }} />
        <Section>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{`Slippage`}</LightHeader>
              </InputHeader>
              <BorderedInput
                required
                id="tokenb-amount-textfield"
                type="string"
                placeholder="0.0"
                onChange={(e) => handleSlippage(e)}
                style={{ alignItems: 'flex-end', width: '100%' }}
              />
              {errors.slippage && <ErrorMsg>{errors.slippage}</ErrorMsg>}
            </InputGroup>
          </CenteredRow>
        </Section>
        <Section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <InputHeader>
            <LightHeader>Price</LightHeader>
            {!priceQueryError ? (
              <ConsoleStat>
                {price?.toFixed(4)} {tokenA} / {tokenB}
              </ConsoleStat>
            ) : (
              <ConsoleStat> ------ </ConsoleStat>
            )}
          </InputHeader>
          {priceQueryError && <ErrorMsg>{priceQueryError}</ErrorMsg>}
        </Section>
        <Section>
          {errors.amountA || errors.amountB || errors.slippage || priceQueryError ? (
            <ButtonPrimary disabled>{`Enter an amount`}</ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={openModal}>{`Swap`}</ButtonPrimary>
          )}
        </Section>
      </Card>
    </>
  )
}
