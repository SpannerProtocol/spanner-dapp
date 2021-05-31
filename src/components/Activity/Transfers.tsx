/* eslint-disable @typescript-eslint/camelcase */
import { useQuery } from '@apollo/client'
import Filter from 'components/Filter'
import { StyledExternalLink } from 'components/Link'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { HeavyText, ItalicText, SectionHeading, StandardText } from 'components/Text'
import { SpacedSection, TransferWrapper } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import transferIn from 'queries/graphql/transferIn'
import transferOut from 'queries/graphql/transferOut'
import { TransferIn, TransferInVariables } from 'queries/graphql/types/TransferIn'
import { TransferOut, TransferOutVariables } from 'queries/graphql/types/TransferOut'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { ThemeContext } from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { TxCell, TxRow } from '.'

interface TransferProp {
  id: string
  amount: string | null
  token: string | null
  fromId: string | null
  toId: string | null
  timestamp: string | null
}

function TransferRow({ id, amount, token, fromId, toId, timestamp }: TransferProp) {
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const wallet = useWallet()
  const { chain } = useChainState()
  const theme = useContext(ThemeContext)

  const blockNum = id.split('-')[0]

  return (
    <>
      {wallet && wallet.address && (
        <TxRow>
          <TxCell>
            <StyledExternalLink fontSize="14px" href={chain && chain.url ? `${chain.url}/query/${blockNum}` : ''}>
              {` ${id}`}
            </StyledExternalLink>
            {timestamp && (
              <ItalicText fontSize="11px">
                {tsToRelative(parseInt(timestamp))} - {tsToDateTimeHuman(parseInt(timestamp))}
              </ItalicText>
            )}
          </TxCell>
          <TxCell>
            {toId && fromId && (
              <div style={{ display: 'flex' }}>
                {wallet.address === toId && (
                  <>
                    <HeavyText fontSize="12px">{t(`From`)}:</HeavyText>
                    <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>
                      {` ${shortenAddr(fromId, 11)}`}
                    </StandardText>
                  </>
                )}
                {wallet.address === fromId && (
                  <>
                    <HeavyText fontSize="12px">{t(`To`)}:</HeavyText>
                    <StandardText fontSize="12px" style={{ marginLeft: '0.5rem' }}>
                      {` ${shortenAddr(toId, 11)}`}
                    </StandardText>
                  </>
                )}
              </div>
            )}
          </TxCell>
          <TxCell>
            {amount && (
              <TransferWrapper color="#fff" background={wallet.address === fromId ? theme.red2 : theme.green2}>
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
  })

  useEffect(() => {
    if (data && data.account) setTotalCount(data.account.transferIn.totalCount)
  }, [data, setTotalCount])

  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <div>Loading</div>}
      {data &&
        data.account &&
        data.account.transferIn.nodes.map((transfer, index) => transfer && <TransferRow key={index} {...transfer} />)}
    </>
  )
}

function TransferOutRows({
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
  const { loading, error, data } = useQuery<TransferOut, TransferOutVariables>(transferOut, {
    variables: {
      address: address,
      first: first,
      offset: offset,
    },
  })

  useEffect(() => {
    if (data && data.account) setTotalCount(data.account.transferOut.totalCount)
  }, [data, setTotalCount])

  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <div>Loading</div>}
      {data &&
        data.account &&
        data.account.transferOut.nodes.map((transfer, index) => transfer && <TransferRow key={index} {...transfer} />)}
    </>
  )
}

export default function Transfers() {
  const { t } = useTranslation()
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ first: number; offset: number }>({ first: 10, offset: 0 })
  const [transferType, setTransferType] = useState<string>('Received')

  useEffect(() => {
    const offset = (page - 1) * 10 > 0 ? (page - 1) * 10 : 0
    setPagination({ first: 10, offset })
  }, [page])

  const filterTransferType = useMemo(() => {
    const options = ['Received', 'Sent']
    return options.map((label) => ({ label, callback: () => setTransferType(label) }))
  }, [])

  return (
    <>
      <SpacedSection>
        <div style={{ display: 'flex' }}>
          <SectionHeading style={{ margin: '0' }}>{t(`Transfers`)}</SectionHeading>
          <QuestionHelper
            size={12}
            backgroundColor={'transparent'}
            text={t(
              `Inbound and Outbound transfers. Green amounts indicate amount received and Red indicates transferred.`
            )}
          />
        </div>
      </SpacedSection>
      <SpacedSection>
        <Filter options={filterTransferType} activeOption={transferType} modalTitle={t(`Filter transfer type`)} />
      </SpacedSection>
      <SpacedSection>
        {transferType === 'Received' && <TransferInRows {...pagination} setTotalCount={setTotalCount} />}
        {transferType === 'Sent' && <TransferOutRows {...pagination} setTotalCount={setTotalCount} />}
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(totalCount / 10)} />
    </>
  )
}
