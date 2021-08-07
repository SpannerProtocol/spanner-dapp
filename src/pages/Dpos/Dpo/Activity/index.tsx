/* eslint-disable @typescript-eslint/camelcase */
import { useLazyQuery, useQuery } from '@apollo/client'
import BN from 'bn.js'
import Card from 'components/Card'
import Pagination from 'components/Pagination'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { Header2, HeavyText, SText } from 'components/Text'
import { ItemWithOpposite, TimelineWithOpposite } from 'components/VerticalTimeline'
import { ContentWrapper, IconWrapper } from 'components/Wrapper'
import { ARGS_HUMAN_APPROVED } from 'constants/extrinsicArgs'
import useBulletTrainArgs from 'hooks/useBulletTrainArgs'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import { useSubstrate } from 'hooks/useSubstrate'
import dpoEvents from 'queries/graphql/dpoEvents'
import eventsByIds from 'queries/graphql/eventByIds'
import { DpoEvents, DpoEventsVariables } from 'queries/graphql/types/DpoEvents'
import {
  EventsByIds,
  EventsByIdsVariables,
  EventsByIds_events_nodes_extrinsic_events,
} from 'queries/graphql/types/EventsByIds'
import React, { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { DpoInfo } from 'spanner-api/types'
import { EventsOrderBy } from 'types/globalTypes'
import { tsToDateTime } from 'utils/formatBlocks'
import { formatToUnit } from 'utils/formatUnit'
import hexToString, { isPrefixedHex } from 'utils/hexToString'
import { shortenAddr } from 'utils/truncateString'
import useTheme from 'utils/useTheme'

interface Tx {
  timestamp: string
  method: string
  section: string
  args: string
}
interface Activity {
  eventId: string
  method: string
  methodReadable: string
  section: string
  tx: Tx
}

function DpoName({ dpoIndex }: { dpoIndex: string | number }) {
  const targetDpo = useSubDpo(dpoIndex)
  return <SText>{targetDpo?.name}</SText>
}

function CabinName({ cabinIndex }: { cabinIndex: string | number }) {
  const targetCabin = useSubTravelCabin(cabinIndex)
  return <SText>{`TravelCabin: ${targetCabin?.name}`}</SText>
}

function CreatedDpo({ argTuples }: { argTuples: string[][] }) {
  const { t } = useTranslation()
  const args: JSX.Element[] = []
  argTuples.forEach((pair, index) => {
    if (pair[0] === 'target') {
      const target = JSON.parse(pair[1])
      if (Object.keys(target).includes('travelCabin')) {
        args.push(
          <RowBetween key={index}>
            <HeavyText>{t(ARGS_HUMAN_APPROVED[pair[0]])}</HeavyText>
            <CabinName cabinIndex={target['travelCabin']} />
          </RowBetween>
        )
      } else if (Object.keys(target).includes('dpo')) {
        args.push(
          <div key={index}>
            <RowBetween>
              <HeavyText>{t(ARGS_HUMAN_APPROVED[pair[0]])}</HeavyText>
              <DpoName dpoIndex={target['dpo'][0]} />
            </RowBetween>
            <RowBetween>
              <HeavyText>{t(`Seats to Purchase`)}</HeavyText>
              <SText>{target['dpo'][1]}</SText>
            </RowBetween>
          </div>
        )
      }
    }
    if (['directReferralRate', 'baseFee'].includes(pair[0])) {
      args.push(
        <RowBetween key={index}>
          <HeavyText>{t(ARGS_HUMAN_APPROVED[pair[0]])}</HeavyText>
          <SText>{parseInt(pair[1]) / 10}%</SText>
        </RowBetween>
      )
    }
    if (['managerSeats'].includes(pair[0])) {
      args.push(
        <RowBetween key={index}>
          <HeavyText>{t(ARGS_HUMAN_APPROVED[pair[0]])}</HeavyText>
          <SText>{pair[1]}</SText>
        </RowBetween>
      )
    }
  })
  return <>{args}</>
}

function SeatsPurchased({ data }: { data: any[] }) {
  const { t } = useTranslation()
  // [signer, buyer, target, seats]

  const isDpo = Object.keys(data[1]).includes('dpo')

  return (
    <>
      <RowBetween>
        <HeavyText>{t(`Buyer`)}</HeavyText>
        {isDpo ? <DpoName dpoIndex={data[1]['dpo']} /> : <SText>{shortenAddr(data[1]['passenger'])}</SText>}
      </RowBetween>
      <RowBetween>
        <HeavyText>{t(`Seats`)}</HeavyText>
        <SText>{data[3]}</SText>
      </RowBetween>
    </>
  )
}

function Released({ txEvents }: { txEvents: EventsByIds_events_nodes_extrinsic_events }) {
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  if (!txEvents.nodes) return null
  let totalAmount = new BN(0)
  let token = ''
  txEvents.nodes.forEach((node) => {
    if (!node) return
    if (!(node.section === 'currencies' && node.method === 'Transferred')) return
    const data = JSON.parse(node.data)
    totalAmount = totalAmount.add(new BN(data[3]))
    token = data[0]['token']
  })
  return (
    <RowBetween>
      <HeavyText>{t(`Amount`)}</HeavyText>
      <SText>
        {formatToUnit(totalAmount, chainDecimals, 2)} {token}
      </SText>
    </RowBetween>
  )
}

function Activities({ eventIds, orderBy }: { eventIds: string[]; orderBy: EventsOrderBy[] }) {
  const methodArgs = useBulletTrainArgs()
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ first: number; offset: number }>({ first: 10, offset: 0 })
  const [totalCount, setTotalCount] = useState<number>(0)
  const { loading, error, data } = useQuery<EventsByIds, EventsByIdsVariables>(eventsByIds, {
    variables: {
      eventIds,
      orderBy,
      first: pagination.first,
      offset: pagination.offset,
    },
    fetchPolicy: 'network-only',
  })
  const { t } = useTranslation()
  const [timelineActivities, setTimelineActivities] = useState<ItemWithOpposite[]>([])

  useEffect(() => {
    if (!data || !data.events || !data.events.nodes) return
    const events = data.events.nodes
    setTotalCount(data.events.totalCount)
    const timelineActivities: ItemWithOpposite[] = []
    events.forEach((event) => {
      if (!event || !event.extrinsic) return
      // Can add any event name modifications here
      let parsedMethod = event.method
      parsedMethod = parsedMethod.replace('FromDpo', '')
      parsedMethod = parsedMethod.replace('DpoTargetPurchased', 'SeatsPurchased')
      const methodReadable = parsedMethod.split(/(?=[A-Z])/).join(' ')
      const parsedData = JSON.parse(event.data)
      // eslint-disable-next-line
      const regex = /(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/
      const argsArray = event.extrinsic.args.split(regex)
      const argsDecodedArray = argsArray.map((e) => (isPrefixedHex(e) ? hexToString(e) : e))
      // console.log('event', event)
      // console.log('event.extrinsic.method', event.extrinsic.method)
      // console.log('methodArgs', methodArgs)
      const dpoExtrinsic = methodArgs[event.extrinsic.method]
      if (!dpoExtrinsic) return
      const argTuples = dpoExtrinsic.map((k, i) => {
        return [k, argsDecodedArray[i]]
      })
      // console.log(parsedData)
      timelineActivities.push({
        leftLabel: tsToDateTime(parseInt(event.extrinsic.timestamp)),
        rightLabel: methodReadable,
        mouseOver: (
          <>
            {event.method === 'CreatedDpo' && <CreatedDpo argTuples={argTuples} />}
            {event.method === 'DpoTargetPurchased' && <SeatsPurchased data={parsedData} />}
            {event.method === 'YieldReleased' && <Released txEvents={event.extrinsic.events} />}
            {event.method === 'BonusReleased' && <Released txEvents={event.extrinsic.events} />}
            {event.method === 'WithdrewFareFromDpo' && <Released txEvents={event.extrinsic.events} />}
          </>
        ),
      })
    })
    setTimelineActivities(timelineActivities)
  }, [data, methodArgs])

  useEffect(() => {
    const offset = (page - 1) * 10 > 0 ? (page - 1) * 10 : 0
    setPagination({ first: 10, offset })
  }, [page])

  return (
    <>
      {error || loading ? (
        <>
          {error && <SText>{t(`Under maintenance`)}</SText>}
          {loading && <Skeleton height={30} count={3} style={{ margin: '0.5rem 0' }} />}
        </>
      ) : (
        <>
          <TimelineWithOpposite items={timelineActivities} />
        </>
      )}
      <Pagination currentPage={setPage} maxPage={Math.ceil(totalCount / 10)} />
    </>
  )
}

export default function Activity({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  const [loadDpoEvents, { loading, error, data }] = useLazyQuery<DpoEvents, DpoEventsVariables>(dpoEvents, {
    variables: {
      id: dpoInfo.index.toString(),
    },
    fetchPolicy: 'network-only',
  })
  const theme = useTheme()
  const { t } = useTranslation()

  const eventIds: string[] = useMemo(() => {
    if (!data || !data.dpo || !data.dpo.events) return []
    return data.dpo.events.split(',')
  }, [data])

  useEffect(() => loadDpoEvents(), [loadDpoEvents])

  return (
    <>
      <ContentWrapper>
        <Card margin="0 0 1rem 0">
          <RowFixed>
            <Header2 width="fit-content">{t('Activity')}</Header2>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(`A list of activities your DPO performed. Amounts shown only account for User members.`)}
            />
            <IconWrapper margin="0 1rem" onClick={() => loadDpoEvents()}>
              <RefreshCw size={'16px'} color={theme.text3} />
            </IconWrapper>
          </RowFixed>
          {error || loading ? (
            <>
              {error && <SText>{t(`Under maintenance`)}</SText>}
              {loading && <Skeleton height={30} count={10} style={{ margin: '0.5rem 0' }} />}
            </>
          ) : (
            <Activities eventIds={eventIds} orderBy={[EventsOrderBy.ID_DESC]} />
          )}
        </Card>
      </ContentWrapper>
    </>
  )
}
