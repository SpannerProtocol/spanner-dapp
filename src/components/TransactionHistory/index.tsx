import { FlatCardPlate } from 'components/Card'
import { SectionHeading, SmallText, StandardText } from 'components/Text'
import { Section, SpacedSection } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import { postTxHistory } from 'queries'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpanfuraEventsDataEvents } from 'spanfura'
import styled from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import truncateString from 'utils/truncateString'

const TxRow = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: none;
    grid-template-rows: auto auto;
    grid-row-gap: 8px;
    grid-column-gap: 0px;
`};
`

const TxCell = styled.div`
  display: block;
  padding: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
`};
`

interface TransactionRowProps {
  event: SpanfuraEventsDataEvents
  index?: number
}

// Tx Hash | Extrinsic Info
function TransactionRow({ event }: TransactionRowProps) {
  return (
    <TxRow>
      <TxCell>
        <StandardText>{truncateString(event.extrinsic_hash)}</StandardText>
        <SmallText>
          {tsToRelative(event.block_timestamp)} - {tsToDateTimeHuman(event.block_timestamp)}
        </SmallText>
      </TxCell>
      <TxCell>
        <StandardText>Module: {event.module_id}</StandardText>
        <StandardText>Method: {event.event_id}</StandardText>
      </TxCell>
    </TxRow>
  )
}

export default function TransactionHistory() {
  const { t } = useTranslation()
  const wallet = useWallet()
  const [transactions, setTransactions] = useState<SpanfuraEventsDataEvents[]>([])

  useEffect(() => {
    if (!wallet || !wallet.address) return
    postTxHistory({ row: 10, page: 0, address: wallet.address, setData: setTransactions })
  }, [wallet])
  console.log('debug transaction:', transactions)

  return (
    <>
      <FlatCardPlate>
        <Section style={{ marginBottom: '1rem', padding: '0' }}>
          <SectionHeading>{t(`Latest Transactions`)}</SectionHeading>
        </Section>
        <SpacedSection>
          {transactions.length > 0 &&
            transactions.map((transaction, index) => <TransactionRow key={index} event={transaction}></TransactionRow>)}
        </SpacedSection>
      </FlatCardPlate>
    </>
  )
}
