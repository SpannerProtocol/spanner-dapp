import { encodeAddress } from '@polkadot/keyring'
import { FlatCard } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import TabBar, { TabMetaData } from 'components/TabBar'
import { HeavyText, ItalicText, SectionHeading, StandardText } from 'components/Text'
import { Section, SectionContainer, SpacedSection, TransferWrapper } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import { postTransfers, postTransfersTokens, postTxHistory } from 'queries'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpanfuraDataEvents, SpanfuraDataExtrinsic } from 'spanfura'
import styled from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToHumanFromUnit, formatToUnit } from 'utils/formatUnit'
import truncateString, { shortenAddr } from 'utils/truncateString'

const TxRow = styled.div`
  display: grid;
  grid-template-columns: min(260px) auto min(160px);
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
              <StandardText fontSize="12px" color={'#3498db'}>
                {truncateString(event.extrinsic_hash, 26)}
              </StandardText>
              <CopyHelper toCopy={`${event.extrinsic_hash}`} />
            </RowBetween>
            <ItalicText fontSize="11px">
              {tsToRelative(event.block_timestamp)} - {tsToDateTimeHuman(event.block_timestamp)}
            </ItalicText>
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="12px">{t(`To`)}:</HeavyText>
                  <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>{` ${shortenAddr(
                    receiver,
                    6
                  )}`}</StandardText>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="12px">{t(`From`)}:</HeavyText>
                  <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>{` ${shortenAddr(
                    sender,
                    6
                  )}`}</StandardText>
                </div>
              </>
            )}
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <TransferWrapper color="#fff" background="#EC3D3D">
                {formatToUnit(event.params_json[2].value, chainDecimals, 2)} BOLT
              </TransferWrapper>
            ) : (
              <TransferWrapper color="#fff" background="#5BC85B">
                {formatToUnit(event.params_json[2].value, chainDecimals, 2)} BOLT
              </TransferWrapper>
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
          <StandardText fontSize="12px" color={'#3498db'}>
            {truncateString(tx.extrinsic_hash, 26)}
          </StandardText>
          <CopyHelper toCopy={`${tx.extrinsic_hash}`} />
        </RowBetween>
        <ItalicText fontSize="11px">
          {tsToRelative(tx.block_timestamp)} - {tsToDateTimeHuman(tx.block_timestamp)}
        </ItalicText>
      </TxCell>
      <TxCell>
        <HeavyText fontSize="12px">{`${tx.call_module_function} (${tx.call_module})`}</HeavyText>
      </TxCell>
      <TxCell>
        <TransferWrapper>{formatToUnit(tx.fee, chainDecimals, 2)} BOLT</TransferWrapper>
      </TxCell>
    </TxRow>
  )
}
function TransferTokenRow({ event }: EventRowProps) {
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const wallet = useWallet()

  const token = event.params_json[0].value.Token
  const sender = encodeAddress('0x' + event.params_json[1].value, 42)
  const receiver = encodeAddress('0x' + event.params_json[2].value, 42)
  const amount = formatToHumanFromUnit(event.params_json[3].value, chainDecimals)

  return (
    <>
      {wallet && wallet.address && (
        <TxRow>
          <TxCell>
            <RowBetween>
              <StandardText fontSize="12px" color={'#3498db'}>
                {truncateString(event.extrinsic_hash, 26)}
              </StandardText>
              <CopyHelper toCopy={`${event.extrinsic_hash}`} />
            </RowBetween>
            <ItalicText fontSize="11px">
              {tsToRelative(event.block_timestamp)} - {tsToDateTimeHuman(event.block_timestamp)}
            </ItalicText>
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="12px">{t(`To`)}:</HeavyText>
                  <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>{` ${shortenAddr(
                    receiver,
                    6
                  )}`}</StandardText>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex' }}>
                  <HeavyText fontSize="12px">{t(`From`)}:</HeavyText>
                  <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>{` ${shortenAddr(
                    sender,
                    6
                  )}`}</StandardText>
                </div>
              </>
            )}
          </TxCell>
          <TxCell>
            {wallet.address === sender ? (
              <TransferWrapper color="#fff" background="#EC3D3D">
                {amount} {token}
              </TransferWrapper>
            ) : (
              <TransferWrapper color="#fff" background="#5BC85B">
                {amount} {token}
              </TransferWrapper>
            )}
          </TxCell>
        </TxRow>
      )}
    </>
  )
}

function TransfersTokens() {
  const { t } = useTranslation()
  const wallet = useWallet()
  const [transactions, setTransactions] = useState<SpanfuraDataEvents[]>([])
  const [meta, setMeta] = useState<{ count: number }>({ count: 0 })
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!wallet || !wallet.address) return
    postTransfersTokens({ row: 10, page: page, address: wallet.address, setData: setTransactions, setMeta })
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
          transactions.map((transaction, index) => (
            <TransferTokenRow key={index} event={transaction}></TransferTokenRow>
          ))}
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(meta.count / 10) - 1} />
    </>
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
    id: 'latest-transactions',
    label: 'Transactions',
  },
  {
    id: 'transfers',
    label: 'Transfers (BOLT)',
  },
  {
    id: 'transfers-tokens',
    label: 'Transfers (Tokens)',
  },
]

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<string>('latest-transactions')

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <>
      <FlatCard>
        <SectionContainer>
          <TabBar
            id={'tabbar-transaction-history'}
            className={'tabbar-container'}
            activeTab={activeTab}
            tabs={tabData}
            onClick={handleTabSelect}
            margin="0"
            fontSize="18px"
            mobileFontSize="12px"
          />
        </SectionContainer>
        <SectionContainer style={{ marginTop: '0' }}>
          {activeTab === 'latest-transactions' && <LatestTransactions />}
          {activeTab === 'transfers' && <Transfers />}
          {activeTab === 'transfers-tokens' && <TransfersTokens />}
        </SectionContainer>
      </FlatCard>
    </>
  )
}
