import Box from '@material-ui/core/Box'
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress'
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress'
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { SText } from 'components/Text'
import { useTranslation } from 'react-i18next'
import './progress.css'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
  const { fontSize, mobileFontSize, displayFilled, ...muiProps } = props
  return (
    <div className={classes.root}>
      <Box position="relative" display="inline-flex" justifyContent="center">
        <CircularProgress
          variant="determinate"
          className={classes.bottom}
          size={props.size ? props.size : 80}
          thickness={props.thickness ? props.thickness : 4}
          {...muiProps}
          value={100}
        />
        <CircularProgress
          variant="determinate"
          className={classes.top}
          classes={{
            circle: classes.circle,
          }}
          size={props.size ? props.size : 80}
          thickness={props.thickness ? props.thickness : 4}
          {...muiProps}
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
              fontSize={fontSize ? fontSize : '10px'}
              mobileFontSize={mobileFontSize ? mobileFontSize : '10px'}
              style={{ margin: 'auto' }}
            >{`${Math.round(props.value)}%`}</SText>
            {displayFilled && (
              <SText
                fontSize={fontSize ? fontSize : '10px'}
                mobileFontSize={mobileFontSize ? mobileFontSize : '10px'}
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
