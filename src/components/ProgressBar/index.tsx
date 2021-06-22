import Box from '@material-ui/core/Box'
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress'
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress'
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { SText } from 'components/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import './progress.css'

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

const ProgressBar = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: 8,
      borderRadius: 5,
    },
    colorPrimary: {
      color: '#FFBE2E',
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    colorSecondary: {
      color: '#EC3D3D',
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#EC3D3D',
    },
  })
)(LinearProgress)

const useLinearStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
})

export function LinearProgressBar(props: LinearProgressProps & { value: number }) {
  const classes = useLinearStyles()
  return (
    <div className={classes.root}>
      <ProgressBar variant="determinate" {...props} />
    </div>
  )
}

export function CircleProgress(
  props: CircularProgressProps & { value: number; fontSize?: string; mobileFontSize?: string; displayFilled?: boolean }
) {
  const classes = useStyles()
  const { t } = useTranslation()
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
            <SText
              fontSize={props.fontSize ? props.fontSize : '10px'}
              mobileFontSize={props.mobileFontSize ? props.mobileFontSize : '11px'}
              style={{ margin: 'auto' }}
            >{`${Math.round(props.value)}%`}</SText>
            {props.displayFilled && (
              <SText
                fontSize={props.fontSize ? props.fontSize : '10px'}
                mobileFontSize={props.mobileFontSize ? props.mobileFontSize : '11px'}
                style={{ margin: 'auto' }}
              >
                {t(`Filled`)}
              </SText>
            )}
          </Typography>
        </Box>
      </Box>
    </div>
  )
}
