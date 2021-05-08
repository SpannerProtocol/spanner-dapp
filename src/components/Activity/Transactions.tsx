/* eslint-disable @typescript-eslint/camelcase */
import { useQuery } from '@apollo/client'
import { StyledExternalLink } from 'components/Link'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, ItalicText, SectionHeading } from 'components/Text'
import { SpacedSection, TransferWrapper } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import extrinsics from 'queries/graphql/extrinsics'
import { Extrinsics, ExtrinsicsVariables, Extrinsics_extrinsics_nodes } from 'queries/graphql/types/Extrinsics'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { ThemeContext } from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import truncateString from 'utils/truncateString'
import { TxCell, TxRow } from '.'

// Tx Hash | Extrinsic Info
function TransactionRow({ id, section, method, timestamp, isSuccess, block }: Extrinsics_extrinsics_nodes) {
  const { chain } = useChainState()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  const blockNum = block && block.number

  return (
    <TxRow>
      <TxCell>
        <RowBetween>
          <StyledExternalLink fontSize="12px" href={chain && chain.url ? `${chain.url}/query/${blockNum}` : ''}>
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
  const { loading, error, data } = useQuery<Extrinsics, ExtrinsicsVariables>(extrinsics, {
    variables: {
      address: address,
      first: first,
      offset: offset,
    },
    pollInterval: 5000,
  })

  useEffect(() => {
    if (data && data.extrinsics) setTotalCount(data.extrinsics.totalCount)
  }, [data, setTotalCount])

  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <div>Loading</div>}
      {data &&
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

  useEffect(() => {
    const offset = (page - 1) * 10 > 0 ? (page - 1) * 10 : 0
    setPagination({ first: 10, offset })
  }, [page])

  return (
    <>
      <SpacedSection>
        <div style={{ display: 'flex', alignItems: 'vertical' }}>
          <SectionHeading>{t(`Transactions`)}</SectionHeading>
          <QuestionHelper
            size={12}
            backgroundColor={'transparent'}
            text={t(`Your latest transactions. Each transaction shows the transaction hash, details and fee.`)}
          />
        </div>
      </SpacedSection>
      <SpacedSection>
        <TransactionRows {...pagination} setTotalCount={setTotalCount}></TransactionRows>
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(totalCount / 10)} />
    </>
  )
}
