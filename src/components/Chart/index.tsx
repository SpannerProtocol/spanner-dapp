import { useLazyQuery } from '@apollo/client'
import { StandardText } from 'components/Text'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { LocalSpinner } from 'pages/Spinner'
import { darken } from 'polished'
import pairPrice from 'queries/graphql/pairPrice'
import { PairPrice, PairPriceVariables } from 'queries/graphql/types/PairPrice'
import React, { useContext, useEffect, useState } from 'react'
import { useMedia } from 'react-use'
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
  return dayjs.utc(dayjs.unix(date)).format('MMM DD')
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
  const below1080 = useMedia('(max-width: 1080px)')
  const [loadPriceData, { loading, error, data }] = useLazyQuery<PairPrice, PairPriceVariables>(pairPrice, {
    variables: {
      pairId: `${token1}-${token2}`,
      first: 60,
      offset: 0,
    },
    fetchPolicy: 'network-only',
  })
  const [priceData, setPriceData] = useState<(ChartParams | undefined)[]>()
  const { t } = useTranslation()

  useEffect(() => {
    loadPriceData()
  }, [loadPriceData])

  useEffect(() => {
    if (!data || !data.pair) return
    const prices = data.pair.pairHourData.nodes.map((node) => {
      if (!node) return undefined
      return {
        timestamp: parseInt(node.hourStartTime),
        price: token1 === 'BOLT' ? parseFloat(node.price) : 1 / parseFloat(node.price),
      }
    })
    if (!prices) return
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

  return (
    <>
      {loading && <LocalSpinner />}
      {error && <StandardText>{t(`Price data unavailable. Please try again later.`)}</StandardText>}
      {priceData && priceData.length > 0 && (
        <ChartWrapper>
          <ResponsiveContainer aspect={below1080 ? 2.5 / 1 : 3 / 1}>
            <AreaChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }} barCategoryGap={1} data={priceData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                tickLine={false}
                axisLine={false}
                interval="preserveEnd"
                tickMargin={16}
                minTickGap={120}
                tickFormatter={(tick) => toNiceDate(tick)}
                dataKey="timestamp"
                tick={{ fill: textColor }}
                type={'number'}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                orientation="right"
                type="number"
                tickCount={4}
                tickFormatter={(tick) => '$' + tick.toFixed(0)}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={50}
                yAxisId={0}
                tick={{ fill: textColor }}
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
