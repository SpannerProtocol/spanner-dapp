import { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { HeavyText, SText } from '../Text'
import { CenterWrapper } from '../Wrapper'

interface TimelineProps {
  date: string
  items: string[]
  finished: boolean
  headline: string
}

const TimelineGrid = styled.div`
  display: grid;
  grid-template-columns: min(80px) min(20px) auto;
  grid-column-gap: 1rem;
  grid-auto-rows: auto;
  justify-content: center;
`

const FilledCircle = styled.div`
  background-color: ${({ theme }) => theme.primary1};
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 50%;
  top: calc(50% - 10px);
  right: -40px;
  width: 10px;
  height: 10px;
  z-index: 2;
  box-shadow: 0px 3px 6px #00000029;
  opacity: 1;
  margin: 0.5rem auto 0 auto;
`

const EmptyCircle = styled.div`
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 50%;
  top: calc(50% - 10px);
  right: -40px;
  width: 10px;
  height: 10px;
  z-index: 2;
  box-shadow: 0px 3px 6px #00000029;
  opacity: 1;
  margin: 0.5rem auto 0 auto;
`

const LineContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 100%;
  position: relative;
  text-align: center;
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: 50%;
    border-left: 2px solid ${({ theme }) => theme.primary1};
    transform: translate(-50%);
  }
`

export default function Timeline({ date, items, finished, headline }: TimelineProps) {
  const theme = useContext(ThemeContext)
  return (
    <TimelineGrid>
      <div style={{ textAlign: 'right' }}>
        <HeavyText color={theme.primary1} fontSize="20px">
          {date}
        </HeavyText>
      </div>
      {finished ? (
        <CenterWrapper>
          <FilledCircle />
          <LineContainer />
        </CenterWrapper>
      ) : (
        <CenterWrapper>
          <EmptyCircle />
          <LineContainer />
        </CenterWrapper>
      )}
      <div
        style={{
          display: 'block',
          textAlign: 'left',
          width: '300px',
          paddingBottom: '1.5rem',
        }}
      >
        <HeavyText fontSize="16px" mobileFontSize="14px">
          {headline}
        </HeavyText>
        <ul style={{ margin: '0', paddingLeft: '1.35rem' }}>
          {items.map((item, index) => (
            <li style={{ fontSize: '11px', lineHeight: '1.5' }} key={index}>
              <SText padding="0" fontSize="12px" color={theme.text5}>
                {item}
              </SText>
            </li>
          ))}
        </ul>
      </div>
    </TimelineGrid>
  )
}
