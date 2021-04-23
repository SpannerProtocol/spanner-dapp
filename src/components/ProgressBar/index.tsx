import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Progress } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import './progress.css'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { StandardText } from 'components/Text'

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
  color: #fff;
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

export const ProgressBar2 = styled(Progress)``

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    bottom: {
      color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    top: {
      color: '#EC3D3D',
      animationDuration: '550ms',
      position: 'absolute',
      left: 0,
    },
    circle: {
      strokeLinecap: 'square',
    },
  })
)

export function CircleProgress(props: CircularProgressProps & { value: number }) {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          className={classes.bottom}
          size={props.size ? props.size : 80}
          thickness={4}
          {...props}
          value={100}
        />
        <CircularProgress
          variant="determinate"
          disableShrink
          className={classes.top}
          classes={{
            circle: classes.circle,
          }}
          size={props.size ? props.size : 80}
          thickness={4}
          {...props}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div" color="textSecondary">
            <StandardText fontSize="10px" style={{ margin: 'auto' }}>{`${Math.round(props.value)}%`}</StandardText>
            <StandardText fontSize="10px" style={{ margin: 'auto' }}>{`Filled`}</StandardText>
          </Typography>
        </Box>
      </Box>
    </div>
  )
}
