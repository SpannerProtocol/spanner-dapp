import { useQuery } from '@apollo/client'
import { encodeAddress } from '@polkadot/keyring'
import BN from 'bn.js'
import { FlatCard } from 'components/Card'
import { StyledExternalLink } from 'components/Link'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import TabBar, { TabMetaData } from 'components/TabBar'
import { HeavyText, ItalicText, SectionHeading, StandardText } from 'components/Text'
import { Section, SectionContainer, SpacedSection, TransferWrapper } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import { postTransfersTokens, postTxHistory } from 'queries'
import transferIn from 'queries/graphql/transferIn'
import { TransferIn, TransferInVariables } from 'queries/graphql/__generated__/TransferIn'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpanfuraDataEvents, SpanfuraDataExtrinsic } from 'spanfura'
import { useChainState } from 'state/connections/hooks'
import styled from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import truncateString, { shortenAddr } from 'utils/truncateString'

const TxRow = styled.div`
  display: grid;
  grid-template-columns: min(240px) auto min(100px);
  grid-column-gap: 1rem;
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

interface TransferProp {
  id: string
  amount: string | null
  token: string | null
  fromId: string | null
  toId: string | null
  timestamp: any | null
}

function TransferRow({ id, amount, token, fromId, toId, timestamp }: TransferProp) {
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const wallet = useWallet()
  const { chain } = useChainState()

  const blockNum = id.split('-')[0]

  return (
    <>
      {wallet && wallet.address && (
        <TxRow>
          <TxCell>
            <StyledExternalLink fontSize="12px" href={chain && chain.url ? `${chain.url}/query/${blockNum}` : ''}>
              {` ${id}`}
            </StyledExternalLink>
            <ItalicText fontSize="11px">
              {tsToRelative(timestamp)} - {tsToDateTimeHuman(timestamp)}
            </ItalicText>
          </TxCell>
          <TxCell>
            {toId ||
              (fromId && (
                <>
                  <div style={{ display: 'inline-flex' }}>
                    <HeavyText fontSize="12px">{wallet.address === toId ? t(`To`) : t(`From`)}:</HeavyText>
                    <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>{` ${shortenAddr(
                      wallet.address === toId ? toId : fromId ? fromId : '',
                      6
                    )}`}</StandardText>
                  </div>
                </>
              ))}
          </TxCell>
          <TxCell>
            {amount && (
              <TransferWrapper color="#fff" background={wallet.address === fromId ? '#EC3D3D' : '#5BC85B'}>
                {formatToUnit(amount, chainDecimals, 2)} {token}
              </TransferWrapper>
            )}
          </TxCell>
        </TxRow>
      )}
    </>
  )
}

function TransferInRows({
  first,
  offset,
  setTotalCount,
}: {
  first: number
  offset: number
  setTotalCount: Dispatcher<number>
}) {
  const wallet = useWallet()

  const address = wallet && wallet.address ? wallet.address : ''
  const { loading, error, data } = useQuery<TransferIn, TransferInVariables>(transferIn, {
    variables: {
      address: address,
      first: first,
      offset: offset,
    },
    pollInterval: 2000,
  })

  console.log(data)

  useEffect(() => {
    if (data && data.account) {
      setTotalCount(data.account.transferIn.totalCount)
    }
  }, [data, setTotalCount])

  return (
    <>
      {error && <div>Woops</div>}
      {loading && <div>Loading</div>}
      {data &&
        data.account &&
        data.account.transferIn.nodes.map((transfer, index) => transfer && <TransferRow key={index} {...transfer} />)}
    </>
  )
}

function Transfers() {
  const { t } = useTranslation()
  // const [transactions, setTransactions] = useState<SpanfuraDataEvents[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ first: number; offset: number }>({ first: 10, offset: 0 })

  useEffect(() => {
    // postTransfers({
    //   chain: chain.chain,
    //   row: 10,
    //   page: page,
    //   address: wallet.address,
    //   setData: setTransactions,
    //   setMeta,
    // })
    // page size will be fixed to 10 until we have a page size filter
    const offset = (page - 1) * 10 > 0 ? (page - 1) * 10 : 0
    setPagination({ first: 10, offset })
    console.log('first', 10, 'offset', offset)
  }, [page])

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
        <TransferInRows {...pagination} setTotalCount={setTotalCount} />
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={totalCount / 10} />
    </>
  )
}

// Tx Hash | Extrinsic Info
function TransactionRow({ tx }: TransactionRowProps) {
  const { chainDecimals } = useSubstrate()
  const { chain } = useChainState()
  return (
    <TxRow>
      <TxCell>
        <RowBetween>
          <StyledExternalLink fontSize="12px" href={chain && chain.url ? `${chain.url}/query/${tx.block_num}` : ''}>
            {truncateString(tx.extrinsic_hash, 26)}
          </StyledExternalLink>
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
  const { chain } = useChainState()

  const token = event.params_json[0].value.Token
  const sender = encodeAddress('0x' + event.params_json[1].value, 42)
  const receiver = encodeAddress('0x' + event.params_json[2].value, 42)
  const amount = formatToUnit(new BN(event.params_json[3].value), chainDecimals, 0, true)

  return (
    <>
      {wallet && wallet.address && (
        <TxRow>
          <TxCell>
            <StyledExternalLink
              fontSize="12px"
              href={chain && chain.url ? `${chain.url}/query/${event.block_num}` : ''}
            >
              {truncateString(event.extrinsic_hash, 26)}
            </StyledExternalLink>
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
  const { chain } = useChainState()

  useEffect(() => {
    if (!wallet || !wallet.address || !chain) return
    postTransfersTokens({
      chain: chain.chain,
      row: 10,
      page: page,
      address: wallet.address,
      setData: setTransactions,
      setMeta,
    })
  }, [wallet, page, chain])

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
          transactions.map((transaction, index) => <TransferTokenRow key={index} event={transaction} />)}
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
  const { chain } = useChainState()

  useEffect(() => {
    if (!wallet || !wallet.address || !chain) return
    postTxHistory({ chain: chain.chain, row: 10, page: page, address: wallet.address, setData: setTransactions })
  }, [wallet, page, chain])

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
