import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const BarContainer = styled.div`
  height: 30px;
  width: 100%;
  background-color: #e0e0de;
  border-radius: 8px;
`

const BarFill = styled.div<{ completion: number }>`
  height: 100%;
  width: ${(props) => props.completion}%;
  background-color: ${({ theme }) => theme.primary1};
  border-radius: inherit;
  text-align: center;
`

const BarLabel = styled.div`
  padding-top: 5px;
  color: white;
  font-weight: 700;
`

interface ProgressBarProps {
  current: number
  end: number
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  const { current, end } = props
  const [completion, setCompletion] = useState<number>(0)

  useEffect(() => {
    setCompletion((current / end) * 100)
  }, [current, end])

  return (
    <BarContainer>
      <BarFill completion={completion}>
        <BarLabel>{`${completion}%`}</BarLabel>
      </BarFill>
    </BarContainer>
  )
}
