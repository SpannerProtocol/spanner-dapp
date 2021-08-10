import { useLazyQuery } from '@apollo/client'
import { SText } from 'components/Text'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { darken } from 'polished'
import pairPrice from 'queries/graphql/pairPrice'
import { PairPrice, PairPriceVariables } from 'queries/graphql/types/PairPrice'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'translate'
import { Dispatcher } from 'types/dispatcher'

dayjs.extend(utc)

const ChartWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`

export const toNiceDate = (date: number) => {
  return dayjs.utc(dayjs.unix(date)).format('DD/MM')
}

export const toNiceDateYear = (date: number) => dayjs.utc(dayjs.unix(date)).local().format('MMMM DD, YYYY HH:mm:ss')

interface ChartProps {
  token1: string
  token2: string
  from: number
  interval: number
  setAvailable?: Dispatcher<boolean>
  setLatestPrice?: Dispatcher<string>
}

interface ChartParams {
  timestamp: number
  price: number
}

export default function PriceChart({ token1, token2, setAvailable, setLatestPrice }: ChartProps) {
  const theme = useContext(ThemeContext)
  const textColor = theme.text3
  const color = theme.primary1
  // const below1080 = useMedia('(max-width: 1080px)')
  const [loadPriceData, { loading, error, data }] = useLazyQuery<PairPrice, PairPriceVariables>(pairPrice, {
    variables: {
      pairId: `${token1}-${token2}`,
      first: 60,
      offset: 0,
    },
    fetchPolicy: 'network-only',
  })
  const [priceData, setPriceData] = useState<ChartParams[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    loadPriceData()
  }, [loadPriceData])

  useEffect(() => {
    if (!data || !data.pair) return
    const prices: ChartParams[] = []
    data.pair.pairHourData.nodes.forEach((node) => {
      if (!node) return undefined
      prices.push({
        timestamp: parseInt(node.hourStartTime),
        price: token1 === 'BOLT' ? parseFloat(node.price) : 1 / parseFloat(node.price),
      })
    })
    setPriceData(prices)
  }, [data, token1])

  useEffect(() => {
    // undefined means still waiting for response from server.
    if (!setAvailable || !setLatestPrice) return
    if (priceData && priceData[0]) {
      setLatestPrice(priceData[0].price.toFixed(4))
      setAvailable(true)
    } else {
      setAvailable(false)
    }
  }, [setLatestPrice, setAvailable, priceData])

  const getMinMax = useCallback((priceData: ChartParams[]) => {
    if (priceData.length === 0) return { min: 0, max: 0 }
    const sorted = [...priceData].sort((a, b) => a.price - b.price)
    return { min: sorted[0].price, max: sorted[sorted.length - 1].price }
  }, [])

  const priceFormatter = useMemo(() => {
    const minMax = getMinMax(priceData)
    if (minMax.max > 100) {
      return (tick: number) => '$' + tick.toFixed(0)
    } else if (minMax.max > 1) {
      return (tick: number) => '$' + tick.toPrecision(2)
    } else {
      return (tick: number) => '$' + tick.toFixed(2)
    }
  }, [getMinMax, priceData])

  return (
    <>
      {loading && <Skeleton height={60} count={1} style={{ margin: '0.5rem 0' }} />}
      {error && <SText>{t(`Price data unavailable. Please try again later.`)}</SText>}
      {priceData.length > 0 && (
        <ChartWrapper>
          <ResponsiveContainer aspect={250 / 100}>
            <AreaChart barCategoryGap={1} data={priceData} margin={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                tickLine={false}
                axisLine={false}
                scale={'time'}
                tickFormatter={(tick) => toNiceDate(tick)}
                dataKey="timestamp"
                tick={{ fill: textColor, fontSize: 12 }}
                // ticks={[priceData[0]['timestamp'], priceData[priceData.length - 1]['timestamp']]}
                tickCount={10}
                minTickGap={30}
                type={'number'}
                domain={['auto', 'dataMax']}
                padding={{ left: 10, right: 20 }}
              />
              <YAxis
                orientation="left"
                type="number"
                tickFormatter={priceFormatter}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={50}
                padding={{ top: 5, bottom: 5 }}
                yAxisId={0}
                width={40}
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <Tooltip
                cursor={true}
                formatter={(val: number) => '$' + val.toFixed(3)}
                labelFormatter={(label) => toNiceDateYear(label)}
                labelStyle={{ paddingTop: 4 }}
                contentStyle={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  borderColor: color,
                  color: 'black',
                }}
                wrapperStyle={{ top: -70, left: -10 }}
              />
              <Area
                key={'other'}
                dataKey={'price'}
                stackId="2"
                strokeWidth={2}
                dot={false}
                type="monotone"
                name={'Price'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}
    </>
  )
}
