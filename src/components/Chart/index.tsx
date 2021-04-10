import React, { useContext, useEffect, useState } from 'react'
import { Area, ResponsiveContainer, Tooltip, AreaChart, YAxis, XAxis } from 'recharts'
import styled, { keyframes, ThemeContext } from 'styled-components'
import { useMedia } from 'react-use'
import { darken } from 'polished'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getPrice } from '../../queries'
import { PriceData } from '../../spanfura'
import { FlexWrapper } from '../Wrapper'
import { Dispatcher } from 'types/dispatcher'

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
  display: flex;
  align-items: center;
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

export const toNiceDateYear = (date: number) => dayjs.utc(dayjs.unix(date)).local().format('MMMM DD, YYYY HH:mm:ss')

interface ChartProps {
  token1: string
  token2: string
  from: number
  interval: number
  setUnavailable?: Dispatcher<boolean>
}

export default function PriceChart({ token1, token2, from, interval, setUnavailable }: ChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>()
  const theme = useContext(ThemeContext)
  const textColor = theme.text3
  const color = theme.primary1
  const below1080 = useMedia('(max-width: 1080px)')

  useEffect(() => {
    getPrice({ token1, token2, from, interval, setData: setPriceData })
  }, [token1, token2, from, interval, setPriceData])

  useEffect(() => {
    // undefined means still waiting for response from server.
    if (!priceData || !setUnavailable) return
    if (priceData.length === 0) {
      setUnavailable(true)
    }
  }, [priceData, setUnavailable])

  return (
    <>
      {!priceData && <LocalLoader />}
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
