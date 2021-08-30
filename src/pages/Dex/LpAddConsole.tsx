import TxModal from 'components/Modal/TxModal'
import { DisclaimerText, ModalText } from 'components/Text'
import TxFee from 'components/TxFee'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from '../../components/Button'
import Card from '../../components/Card'
import { CenteredRow, RowBetween } from '../../components/Row'
import { BorderedWrapper, FlexWrapper, Section } from '../../components/Wrapper'
import { formatToUnit, unitToBn } from '../../utils/formatUnit'
import {
  ConsoleStat,
  HeavyHeader,
  InputGroup,
  InputHeader,
  LightHeader,
  TokenInputAmount,
  TokenInputWrapper,
} from './components'
import TokenSelector from './components/TokenSelector'

interface LpAddData {
  amountA: number
  amountB: number
  tokenA: string
  tokenB: string
  price?: number
  estimatedFee?: string
}

function LpAddModalContent({ amountA, amountB, tokenA, tokenB, estimatedFee }: LpAddData): JSX.Element {
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <CenteredRow style={{ margin: '0.85rem', fontWeight: 'bolder' }}>{t(`You will receive:`)}</CenteredRow>
        <CenteredRow>
          <ModalText>
            {Math.max(amountA, amountB)} {tokenA}/{tokenB} {t(`Pool Tokens`)}
          </ModalText>
        </CenteredRow>
      </Section>
      <Section>
        <CenteredRow>
          <DisclaimerText>{t(`Output amount is estimated.`)}</DisclaimerText>
        </CenteredRow>
      </Section>
      <Section>
        <BorderedWrapper>
          <RowBetween>
            <HeavyHeader>
              {tokenA} {t(`to deposit`)}
            </HeavyHeader>
            <ConsoleStat>{amountA}</ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>
              {tokenB} {t(`to deposit`)}
            </HeavyHeader>
            <ConsoleStat>{amountB}</ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>{t(`Rates`)}</HeavyHeader>
            <ConsoleStat>
              1 {tokenB} = {amountB / amountA} {tokenA}
            </ConsoleStat>
          </RowBetween>
        </BorderedWrapper>
        <TxFee fee={estimatedFee} />
      </Section>
    </>
  )
}

export default function LpAddConsole(): JSX.Element {
  const [tokenA, setTokenA] = useState<string>('BOLT')
  const [tokenB, setTokenB] = useState<string>('WUSD')
  const [amountA, setAmountA] = useState<number>(0)
  const [amountB, setAmountB] = useState<number>(0)
  const { chainDecimals } = useSubstrate()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { t } = useTranslation()

  const balanceA = useSubscribeBalance(tokenA)
  const balanceB = useSubscribeBalance(tokenB)

  const openModal = () => {
    const txData = createTx({
      section: 'dex',
      method: 'addLiquidity',
      params: {
        currencyIdA: { Token: tokenA },
        currencyIdB: { Token: tokenB },
        maxAmountA: unitToBn(amountA, chainDecimals).toString(),
        maxAmountB: unitToBn(amountB, chainDecimals).toString(),
      },
    })
    if (!txData) return
    txData.estimatedFee.then((fee) => setTxInfo((prev) => ({ ...prev, estimatedFee: fee })))
    setModalOpen(true)
  }

  const dismissModal = () => {
    ;[setTxPendingMsg, setTxHash, setTxErrorMsg].forEach((fn) => fn(undefined))
    setModalOpen(false)
  }

  return (
    <>
      <TxModal
        isOpen={modalOpen}
        onDismiss={dismissModal}
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg, dismissModal })}
        title={t(`Confirm`)}
        buttonText={t(`Confirm`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <LpAddModalContent
          amountA={amountA}
          amountB={amountB}
          tokenA={tokenA}
          tokenB={tokenB}
          estimatedFee={txInfo?.estimatedFee}
        />
      </TxModal>
      <Card>
        <Section>
          <CenteredRow style={{ justifyContent: 'center' }}>
            <InputGroup>
              <InputHeader>
                <LightHeader>{t(`Max Input`)}</LightHeader>
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
                  onChange={(e) => setAmountA(parseFloat(e.target.value))}
                  pattern="[0-9]*"
                  style={{ alignItems: 'flex-start', width: '100%' }}
                />
                <TokenSelector defaultToken={'BOLT'} selectToken={(token) => setTokenA(token)} />
              </TokenInputWrapper>
            </InputGroup>
          </CenteredRow>
          <CenteredRow style={{ margin: '0.85rem' }}>
            <b>+</b>
          </CenteredRow>
          <CenteredRow>
            <InputGroup>
              <InputHeader>
                <LightHeader>{t(`Max Input`)}</LightHeader>
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
                  onChange={(e) => setAmountB(parseFloat(e.target.value))}
                  style={{ alignItems: 'flex-start', width: '100%' }}
                  color="primary"
                />
                <TokenSelector defaultToken={'WUSD'} selectToken={(token) => setTokenB(token)} />
              </TokenInputWrapper>
            </InputGroup>
          </CenteredRow>
        </Section>
        <Section>
          <FlexWrapper style={{ marginTop: '4vh' }}>
            <ButtonPrimary onClick={openModal}>{t(`Add Liquidity`)}</ButtonPrimary>
          </FlexWrapper>
        </Section>
      </Card>
    </>
  )
}
