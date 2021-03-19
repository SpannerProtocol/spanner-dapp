import BigNumber from 'bignumber.js'
import { ButtonPrimary } from 'components/Button'
import TxModal from 'components/Modal/TxModal'
import { ModalText, StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { LpBalance, useAllLpBalances } from 'hooks/useQueryBalance'
import useSubscribePool from 'hooks/useQueryDexPrice'
import { useSubstrate } from 'hooks/useSubstrate'
import useTxHelpers, { TxInfo } from 'hooks/useTxHelpers'
import { TradingPair } from 'interfaces/dex'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit, unitToBn } from 'utils/formatUnit'
import { getPairName } from 'utils/getPairName'
import Card from '../../components/Card'
import ExpandCard from '../../components/Card/ExpandCard'
import { BorderedInput } from '../../components/Input'
import { CenteredRow, RowBetween } from '../../components/Row'
import { BorderedWrapper, Section, SpacedSection } from '../../components/Wrapper'
import { ConsoleStat, HeavyHeader, InputGroup, InputHeader, LightHeader } from './components'

export const CardText = styled.div`
  font-size: 14px;
  color: #000;
`
interface LpPoolContentProps {
  pool: LpBalance
  pair: TradingPair
}

interface LpRemoveModalProps extends LpPoolContentProps {
  removeAmount: number
  estimatedFee?: string
}

function LpRemoveModalContent({ data }: { data: LpRemoveModalProps }): JSX.Element {
  const { t } = useTranslation()

  const { pair, removeAmount, estimatedFee } = data
  return (
    <>
      <Section>
        <CenteredRow>
          <ModalText>
            {removeAmount} {getPairName(pair)}
          </ModalText>
        </CenteredRow>
      </Section>
      <SpacedSection>
        <RowBetween>
          <StandardText>{t(`Remove LP Tokens`)}</StandardText>
          <StandardText>{removeAmount}</StandardText>
        </RowBetween>
      </SpacedSection>
      <TxFee fee={estimatedFee} />
    </>
  )
}

function LpPoolContent(props: LpPoolContentProps): JSX.Element {
  const { pool, pair } = props
  const { dexShare } = useSubscribePool([pair[0], pair[1]], 250)
  const { chainDecimals } = useSubstrate()
  const [amountA, setAmountA] = useState<BigNumber>(new BigNumber(0))
  const [amountB, setAmountB] = useState<BigNumber>(new BigNumber(0))
  const [amountLp, setAmountLp] = useState<BigNumber>(new BigNumber(0))
  const [removeAmount, setRemoveAmount] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const { createTx, submitTx } = useTxHelpers()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { t } = useTranslation()

  useEffect(() => {
    if (!dexShare) return
    // const decimalScale = new BigNumber(10 ** chainDecimals)
    const lpUnit = new BigNumber(pool.balance.free.toString())
    const amountAUnit = new BigNumber(dexShare[0].toString())
    const amountBUnit = new BigNumber(dexShare[1].toString())
    setAmountLp(lpUnit)
    setAmountA(amountAUnit)
    setAmountB(amountBUnit)
  }, [dexShare, pool.balance.free, chainDecimals])

  const handleRemove = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setRemoveAmount(value)
  }

  const openModal = () => {
    const txData = createTx({
      section: 'dex',
      method: 'removeLiquidity',
      params: {
        currencyIdA: { Token: pair[0].asToken.toString() },
        currencyIdB: { Token: pair[1].asToken.toString() },
        removeShare: unitToBn(removeAmount, chainDecimals).toString(),
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
        onConfirm={() => submitTx({ setTxErrorMsg, setTxHash, setTxPendingMsg })}
        title={t(`Remove Liquidity`)}
        buttonText={t(`Remove`)}
        txError={txErrorMsg}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        <LpRemoveModalContent data={{ ...props, removeAmount, estimatedFee: txInfo?.estimatedFee }} />
      </TxModal>
      <Section style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
        <RowBetween>
          <CardText>{`My LP Tokens`}</CardText>
          <CardText>{formatToUnit(amountLp, chainDecimals)}</CardText>
        </RowBetween>
      </Section>
      <Section>
        <BorderedWrapper>
          <StandardText style={{ marginBottom: '1rem' }}>{t(`Pool Info`)}</StandardText>
          <RowBetween>
            <HeavyHeader>
              {t(`Pooled`)} {pair[0].asToken.toString()}
            </HeavyHeader>
            <ConsoleStat>{formatToUnit(amountA, chainDecimals)}</ConsoleStat>
          </RowBetween>
          <RowBetween>
            <HeavyHeader>
              {t(`Pooled`)} {pair[1].asToken.toString()}
            </HeavyHeader>
            <ConsoleStat>{formatToUnit(amountB, chainDecimals)}</ConsoleStat>
          </RowBetween>
        </BorderedWrapper>
      </Section>
      <Section>
        <InputGroup>
          <InputHeader>
            <LightHeader>{t(`Remove LP Amount`)}</LightHeader>
          </InputHeader>
          <BorderedInput
            required
            id="remove-amount-textfield"
            type="string"
            placeholder="0.0"
            onChange={(e) => handleRemove(e)}
            style={{ alignItems: 'flex-end', width: '100%' }}
            color="primary"
          />
        </InputGroup>
      </Section>
      <Section style={{ marginTop: '12px' }}>
        <RowBetween>
          <ButtonPrimary onClick={openModal} style={{ width: '100%', padding: '8px', borderRadius: '8px' }}>
            {t(`Remove`)}
          </ButtonPrimary>
        </RowBetween>
      </Section>
    </>
  )
}

export default function LpRemoveConsole(): JSX.Element {
  const balances = useAllLpBalances()
  const { t } = useTranslation()
  return (
    <Card>
      <Section>
        <RowBetween>{t(`Liquidity Pools`)}</RowBetween>
      </Section>
      <Section>
        {balances.length > 0 ? (
          balances.map((poolBalance, index) => (
            <ExpandCard key={index} defaultExpanded={false} title={getPairName(poolBalance.poolPair)}>
              <LpPoolContent pool={poolBalance} pair={poolBalance.poolPair} />
            </ExpandCard>
          ))
        ) : (
          <div>{t(`You have not added liquidity to any pools.`)}</div>
        )}
      </Section>
    </Card>
  )
}
