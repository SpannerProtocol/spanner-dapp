import React, { useEffect, useState } from 'react'
import { Area, ResponsiveContainer, Tooltip, AreaChart, YAxis, XAxis } from 'recharts'
import styled, { keyframes } from 'styled-components'
import { useMedia } from 'react-use'
import { darken } from 'polished'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getPrice } from '../../queries'
import { PriceData } from '../../spanfura'
import { FlexWrapper } from '../Wrapper'

dayjs.extend(utc)

const pulse = keyframes`
  0% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const AnimatedImg = styled.div`
  animation: ${pulse} 800ms linear infinite;
  & > * {
    width: 50px;
  }
`

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const LocalLoader = () => {
  return (
    <FlexWrapper>
      <AnimatedImg>
        <img src={require('../../assets/svg/logo-spanner-yellow.svg')} alt="loading-icon" />
      </AnimatedImg>
    </FlexWrapper>
  )
}

export const toNiceDate = (date: number) => {
  return dayjs.utc(dayjs.unix(date)).format('MMM DD')
}

export const toNiceDateYear = (date: number) => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

interface ChartProps {
  token1: string
  token2: string
  from: number
  interval: number
}

const Chart = ({ token1, token2, from, interval }: ChartProps) => {
  const textColor = 'black'
  const color = '#ffbe2e'
  const below1080 = useMedia('(max-width: 1080px)')

  const [priceData, setPriceData] = useState<PriceData[]>([])

  useEffect(() => {
    getPrice({ token1, token2, from, interval, setData: setPriceData })
  }, [token1, token2, from, interval, setPriceData])

  return (
    <ChartWrapper>
      {priceData.length > 0 ? (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 16}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={priceData}>
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
              tickFormatter={(tick) => '$' + tick.toFixed(0)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
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
      ) : (
        <LocalLoader />
      )}
    </ChartWrapper>
  )
}
export default Chart
