import { FlatCard } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import TabBar, { TabMetaData } from 'components/TabBar'
import { HeavyText, SectionHeading, SmallText, StandardText } from 'components/Text'
import { FeeWrapper, Section, SectionContainer, SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import { postTxHistory, postTransfers } from 'queries'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpanfuraDataEvents, SpanfuraDataExtrinsic } from 'spanfura'
import styled from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import truncateString from 'utils/truncateString'
import { encodeAddress } from '@polkadot/keyring'

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
    grid-template-rows: auto auto auto auto;
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

interface EventRowProps {
  event: SpanfuraDataEvents
  index?: number
}

function TransferRow({ event }: EventRowProps) {
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const wallet = useWallet()

  const sender = encodeAddress('0x' + event.params_json[0].value, 42)
  const receiver = encodeAddress('0x' + event.params_json[1].value, 42)

  return (
    <>
      {wallet && wallet.address && (
        <TxRow>
          <TxCell>
            <RowBetween>
              <StandardText color={'#3498db'}>{truncateString(event.extrinsic_hash, 36)}</StandardText>
              <CopyHelper toCopy={`${event.extrinsic_hash}`} />
            </RowBetween>
            <SmallText>
              {tsToRelative(event.block_timestamp)} - {tsToDateTimeHuman(event.block_timestamp)}
            </SmallText>
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="14">{t(`To`)}:</HeavyText>
                  <StandardText style={{ marginLeft: '0.5rem' }}>{` ${truncateString(receiver)}`}</StandardText>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="14">{t(`From`)}:</HeavyText>
                  <StandardText style={{ marginLeft: '0.5rem' }}>{` ${truncateString(sender)}`}</StandardText>
                </div>
              </>
            )}
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <FeeWrapper color="#fff" background="#EC3D3D">
                {formatToUnit(event.params_json[2].value, chainDecimals, 2)} BOLT
              </FeeWrapper>
            ) : (
              <FeeWrapper color="#fff" background="#5BC85B">
                {formatToUnit(event.params_json[2].value, chainDecimals, 2)} BOLT
              </FeeWrapper>
            )}
          </TxCell>
        </TxRow>
      )}
    </>
  )
}

function Transfers() {
  const { t } = useTranslation()
  const wallet = useWallet()
  const [transactions, setTransactions] = useState<SpanfuraDataEvents[]>([])
  const [meta, setMeta] = useState<{ count: number }>({ count: 0 })
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!wallet || !wallet.address) return
    postTransfers({ row: 10, page: page, address: wallet.address, setData: setTransactions, setMeta })
  }, [wallet, page])

  return (
    <>
      <Section style={{ marginBottom: '1rem', padding: '0' }}>
        <div style={{ display: 'flex' }}>
          <SectionHeading>{t(`Transfers`)}</SectionHeading>
          <QuestionHelper
            size={14}
            backgroundColor={'transparent'}
            text={t(
              `Inbound and Outbound transfers. Green amounts indicate amount received and Red indicates transferred.`
            )}
          />
        </div>
      </Section>
      <SpacedSection>
        {transactions.length > 0 &&
          transactions.map((transaction, index) => <TransferRow key={index} event={transaction}></TransferRow>)}
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(meta.count / 10) - 1} />
    </>
  )
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

export function LatestTransactions() {
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
      <Section style={{ marginBottom: '1rem', padding: '0' }}>
        <div style={{ display: 'flex' }}>
          <SectionHeading>{t(`Latest Transactions`)}</SectionHeading>
          <QuestionHelper
            size={14}
            backgroundColor={'transparent'}
            text={t(`Your latest transactions. Each transaction shows the transaction hash, details and fee.`)}
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
    </>
  )
}

const tabData: Array<TabMetaData> = [
  {
    id: 'tab-latest-transactions',
    className: 'tab latest-transactions-container',
    label: 'Latest Transactions',
  },
  {
    id: 'tab-transfers',
    className: 'tab transfers-container',
    label: 'Transfers',
  },
]

const tabOptions = ['latest-transactions', 'transfers']

export default function TransactionHistory() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('balances')

  const handleTabSelect = (indexClicked: number) => {
    setActiveTabIndex(indexClicked)
  }

  useEffect(() => {
    const tabName = tabOptions[activeTabIndex]
    setActiveTab(tabName)
  }, [activeTabIndex])

  return (
    <>
      <FlatCard>
        <SectionContainer>
          <TabBar
            id={'tabbar-transaction-history'}
            className={'tabbar-container'}
            tabs={tabData}
            onClick={handleTabSelect}
            margin="0"
          />
        </SectionContainer>
        <SectionContainer style={{ marginTop: '0' }}>
          {activeTab === 'latest-transactions' && <LatestTransactions />}
          {activeTab === 'transfers' && <Transfers />}
        </SectionContainer>
      </FlatCard>
    </>
  )
}
