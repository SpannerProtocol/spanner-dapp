import { FlatCardPlate } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, SectionHeading, SmallText, StandardText } from 'components/Text'
import { FeeWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import { postTxHistory } from 'queries'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpanfuraDataExtrinsic } from 'spanfura'
import styled from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import truncateString from 'utils/truncateString'

const TxRow = styled.div`
  display: grid;
  grid-template-columns: min(320px) auto min(160px);
  grid-column-gap: 40px;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-gap: 5px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: none;
    grid-template-rows: auto auto;
    grid-row-gap: 0px;
    grid-column-gap: 0px;
    padding: 0.5rem;
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
  tx: SpanfuraDataExtrinsic
  index?: number
}

// Tx Hash | Extrinsic Info
function TransactionRow({ tx }: TransactionRowProps) {
  const { chainDecimals } = useSubstrate()
  return (
    <TxRow>
      <TxCell>
        <RowBetween>
          <StandardText color={'#3498db'}>{truncateString(tx.extrinsic_hash, 36)}</StandardText>
          <CopyHelper toCopy={`${tx.extrinsic_hash}`} />
        </RowBetween>
        <SmallText>
          {tsToRelative(tx.block_timestamp)} - {tsToDateTimeHuman(tx.block_timestamp)}
        </SmallText>
      </TxCell>
      <TxCell>
        <HeavyText fontSize="14">{`${tx.call_module_function} (${tx.call_module})`}</HeavyText>
      </TxCell>
      <TxCell>
        <FeeWrapper>{formatToUnit(tx.fee, chainDecimals, 2)} BOLT</FeeWrapper>
      </TxCell>
    </TxRow>
  )
}

export default function TransactionHistory() {
  const { t } = useTranslation()
  const wallet = useWallet()
  const [transactions, setTransactions] = useState<SpanfuraDataExtrinsic[]>([])
  const [page, setPage] = useState(0)
  const [hadTransactions, setHadTransactions] = useState<boolean>(false)
  const [lastPage, setLastPage] = useState<number>()

  useEffect(() => {
    if (!wallet || !wallet.address) return
    postTxHistory({ row: 10, page: page, address: wallet.address, setData: setTransactions })
  }, [wallet, page])

  // A permenant flag to change the message for the next page if the user had transactions
  useEffect(() => {
    transactions.length > 0 && setHadTransactions(true)
  }, [page, transactions])

  // Determine the last page dynamically to prevent further nextPage
  // since we don't know what the last page will be.
  useEffect(() => {
    hadTransactions && transactions.length === 0 && setLastPage(page - 1)
  }, [transactions, hadTransactions, page])

  return (
    <>
      <FlatCardPlate>
        <Section style={{ marginBottom: '1rem', padding: '0' }}>
          <div style={{ display: 'flex' }}>
            <SectionHeading>{t(`Latest Transactions`)}</SectionHeading>
            <QuestionHelper
              size={14}
              backgroundColor={'transparent'}
              text={t(`Each transaction shows the transaction hash, details and fee.`)}
            />
          </div>
        </Section>
        <SpacedSection>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => <TransactionRow key={index} tx={transaction}></TransactionRow>)
          ) : (
            <>
              {hadTransactions ? (
                <StandardText>{t(`Could not find any more transactions`)}</StandardText>
              ) : (
                <StandardText>{t(`No transactions found.`)}</StandardText>
              )}
            </>
          )}
        </SpacedSection>
        <Pagination currentPage={setPage} maxPage={lastPage} />
      </FlatCardPlate>
    </>
  )
}
