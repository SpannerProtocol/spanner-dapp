/* eslint-disable @typescript-eslint/camelcase */
import { ApolloError, useLazyQuery } from '@apollo/client'
import Filter from 'components/Filter'
import { StyledExternalLink } from 'components/Link'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { IconWrapper, SpacedSection, TransferWrapper } from 'components/Wrapper'
import { HeavyText, ItalicText, Header2, SText } from 'components/Text'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import transferIn from 'queries/graphql/transferIn'
import transferOut from 'queries/graphql/transferOut'
import { TransferIn, TransferInVariables } from 'queries/graphql/types/TransferIn'
import { TransferOut, TransferOutVariables } from 'queries/graphql/types/TransferOut'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { ThemeContext } from 'styled-components'
import { tsToDateTimeHuman, tsToRelative } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import { shortenAddr } from 'utils/truncateString'
import { TxCell, TxRow } from '.'
import Skeleton from 'react-loading-skeleton'

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
            <StyledExternalLink
              color={theme.blue2}
              fontSize="14px"
              href={chain && chain.url ? `${chain.url}/query/${blockNum}` : ''}
            >
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
                    <SText fontSize="12px" style={{ marginLeft: '0.5rem' }}>
                      {` ${shortenAddr(fromId, 11)}`}
                    </SText>
                  </>
                )}
                {wallet.address === fromId && (
                  <>
                    <HeavyText fontSize="12px">{t(`To`)}:</HeavyText>
                    <SText fontSize="12px" style={{ marginLeft: '0.5rem' }}>
                      {` ${shortenAddr(toId, 11)}`}
                    </SText>
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
  error,
  loading,
  data,
}: {
  error: ApolloError | undefined
  loading: boolean
  data?: TransferIn
}) {
  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <Skeleton height={40} count={1} style={{ margin: '0.5rem 0' }} />}
      {!loading &&
        data &&
        data.account &&
        data.account.transferIn.nodes.map((transfer, index) => transfer && <TransferRow key={index} {...transfer} />)}
    </>
  )
}

function TransferOutRows({
  error,
  loading,
  data,
}: {
  error: ApolloError | undefined
  loading: boolean
  data?: TransferOut
}) {
  return (
    <>
      {error && <div>{error.message}</div>}
      {loading && <Skeleton height={40} count={1} style={{ margin: '0.5rem 0' }} />}
      {!loading &&
        data &&
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
  const wallet = useWallet()
  const address = wallet && wallet.address ? wallet.address : ''
  const theme = useContext(ThemeContext)
  const [loadInData, { loading: inLoading, error: inError, data: inData }] = useLazyQuery<
    TransferIn,
    TransferInVariables
  >(transferIn, {
    variables: {
      address: address,
      first: pagination.first,
      offset: pagination.offset,
    },
    fetchPolicy: 'network-only',
  })
  const [loadOutData, { loading: outLoading, error: outError, data: outData }] = useLazyQuery<
    TransferOut,
    TransferOutVariables
  >(transferOut, {
    variables: {
      address: address,
      first: pagination.first,
      offset: pagination.offset,
    },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (transferType === 'Received') {
      if (inData && inData.account) setTotalCount(inData.account.transferIn.totalCount)
    } else if (transferType === 'Sent') {
      if (outData && outData.account) setTotalCount(outData.account.transferOut.totalCount)
    }
  }, [transferType, inData, setTotalCount, outData])

  useEffect(() => {
    if (transferType === 'Received') {
      loadInData({
        variables: {
          address: address,
          first: pagination.first,
          offset: pagination.offset,
        },
      })
    } else if (transferType === 'Sent') {
      loadOutData({
        variables: {
          address: address,
          first: pagination.first,
          offset: pagination.offset,
        },
      })
    }
  }, [address, loadInData, loadOutData, pagination.first, pagination.offset, transferType])

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Header2 width="fit-content" style={{ margin: '0' }}>
            {t(`Transfers`)}
          </Header2>
          <QuestionHelper
            size={12}
            backgroundColor={'transparent'}
            text={t(
              `Inbound and Outbound transfers. Green amounts indicate amount received and Red indicates transferred.`
            )}
          />
          <IconWrapper margin="0 0.5rem">
            <RefreshCw
              onClick={
                transferType === 'Received'
                  ? () =>
                      loadInData({
                        variables: {
                          address: address,
                          first: pagination.first,
                          offset: pagination.offset,
                        },
                      })
                  : () =>
                      loadOutData({
                        variables: {
                          address: address,
                          first: pagination.first,
                          offset: pagination.offset,
                        },
                      })
              }
              size={'16px'}
              color={theme.text3}
            />
          </IconWrapper>
        </div>
      </SpacedSection>
      <SpacedSection>
        <Filter options={filterTransferType} activeOption={transferType} modalTitle={t(`Filter transfer type`)} />
      </SpacedSection>
      <SpacedSection>
        {transferType === 'Received' && <TransferInRows data={inData} error={inError} loading={inLoading} />}
        {transferType === 'Sent' && <TransferOutRows data={outData} error={outError} loading={outLoading} />}
      </SpacedSection>
      <Pagination currentPage={setPage} maxPage={Math.ceil(totalCount / 10)} />
    </>
  )
}
