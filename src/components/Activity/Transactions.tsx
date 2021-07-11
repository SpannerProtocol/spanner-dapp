/* eslint-disable @typescript-eslint/camelcase */
import { ApolloError, useLazyQuery } from '@apollo/client'
import { StyledExternalLink } from 'components/Link'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { Header2, HeavyText, ItalicText } from 'components/Text'
import { IconWrapper, SpacedSection, TransferWrapper } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import extrinsics from 'queries/graphql/extrinsics'
import {
  ExtrinsicsByAddress,
  ExtrinsicsByAddressVariables,
  ExtrinsicsByAddress_extrinsics_nodes,
} from 'queries/graphql/types/ExtrinsicsByAddress'
import React, { useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { useChainState } from 'state/connections/hooks'
import { ThemeContext } from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import truncateString from 'utils/truncateString'
import { TxCell, TxRow } from '.'

// Tx Hash | Extrinsic Info
function TransactionRow({ id, section, method, timestamp, isSuccess, block }: ExtrinsicsByAddress_extrinsics_nodes) {
  const { chain } = useChainState()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  const blockNum = block && block.number

  return (
    <TxRow>
      <TxCell>
        <RowBetween>
          <StyledExternalLink
            color={theme.blue2}
            fontSize="12px"
            href={chain && chain.url ? `${chain.url}/query/${blockNum}` : ''}
          >
            {truncateString(id, 26)}
          </StyledExternalLink>
        </RowBetween>
        {timestamp && (
          <ItalicText fontSize="11px">
            {tsToRelative(parseInt(timestamp))} - {tsToDateTimeHuman(timestamp)}
          </ItalicText>
        )}
      </TxCell>
      <TxCell>
        <HeavyText fontSize="12px" style={{ wordBreak: 'break-word' }}>{`${method} (${section})`}</HeavyText>
      </TxCell>
      <TxCell>
        <TransferWrapper color="#fff" background={isSuccess ? theme.green2 : theme.red2}>
          {isSuccess ? t(`Succeeded`) : t(`Failed`)}
        </TransferWrapper>
      </TxCell>
    </TxRow>
  )
}

function TransactionRows({
  loading,
  error,
  data,
}: {
  loading: boolean
  error: ApolloError | undefined
  data: ExtrinsicsByAddress | undefined
}) {
  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <Skeleton height={40} count={3} style={{ margin: '0.5rem 0' }} />}
      {!loading &&
        data &&
        data.extrinsics &&
        data.extrinsics.nodes.map((extrinsic, index) => extrinsic && <TransactionRow key={index} {...extrinsic} />)}
    </>
  )
}

export default function Transactions() {
  const { t } = useTranslation()
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ first: number; offset: number }>({ first: 10, offset: 0 })
  const theme = useContext(ThemeContext)
  const wallet = useWallet()
  const address = wallet && wallet.address ? wallet.address : ''
  const [loadTransaction, { loading, error, data }] = useLazyQuery<ExtrinsicsByAddress, ExtrinsicsByAddressVariables>(
    extrinsics,
    {
      variables: {
        address: address,
        first: pagination.first,
        offset: pagination.offset,
      },
      fetchPolicy: 'network-only',
    }
  )

  useEffect(() => {
    loadTransaction()
  }, [loadTransaction])

  useEffect(() => {
    const offset = (page - 1) * 10 > 0 ? (page - 1) * 10 : 0
    setPagination({ first: 10, offset })
  }, [page])

  useEffect(() => {
    if (data && data.extrinsics) setTotalCount(data.extrinsics.totalCount)
  }, [data, setTotalCount])

  return (
    <>
      <SpacedSection>
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Header2 width="fit-content">{t(`Transactions`)}</Header2>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(`Your latest transactions. Each transaction shows the transaction hash, details and fee.`)}
            />
            <IconWrapper margin="0 1rem" onClick={() => loadTransaction()}>
              <RefreshCw size={'16px'} color={theme.text3} />
            </IconWrapper>
          </div>
        </RowBetween>
      </SpacedSection>
      <SpacedSection>
        <TransactionRows loading={loading} error={error} data={data} />
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(totalCount / 10)} />
    </>
  )
}
