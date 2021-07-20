import Step from '@material-ui/core/Step'
import StepButton from '@material-ui/core/StepButton'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { SText } from 'components/Text'
import React, { useEffect, useMemo } from 'react'
import { Dispatcher } from 'types/dispatcher'
import { DpoInfo } from 'spanner-api/types'
import { getDpoCompletedStates } from 'utils/dpoStateCompleted'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      color: '#dfdfe1',
    },
    completed: {
      display: 'inline-block',
      color: '#fff',
    },
    label: {
      textTransform: 'capitalize',
    },
  })
)

type ValidState = 'CREATED' | 'ACTIVE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
type ValidStep = 'CREATED' | 'ACTIVE' | 'RUNNING' | 'COMPLETED'

function getStateMap(state: ValidState): ValidStep {
  const states = {
    CREATED: 'CREATED',
    ACTIVE: 'ACTIVE',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  }
  return states[state] as ValidStep
}

export default function DpoStateBar({
  dpoInfo,
  defaultState,
  setSelectedState,
}: {
  dpoInfo: DpoInfo
  defaultState: string
  setSelectedState: Dispatcher<string | undefined>
}) {
  const classes = useStyles()
  // FAILED state will be lumped with CREATED and if FAILED then CREATED label will be EXPIRED
  const normalSteps = useMemo(() => ['CREATED', 'ACTIVE', 'RUNNING', 'COMPLETED'], [])
  const failedSteps = useMemo(() => ['CREATED', 'FAILED'], [])
  const steps = useMemo(() => (dpoInfo.state.isFailed ? failedSteps : normalSteps), [dpoInfo, failedSteps, normalSteps])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultStepIndex = useMemo(() => steps.findIndex((step) => step === defaultState), [])
  const [activeStep, setActiveStep] = React.useState(defaultStepIndex)
  const { t } = useTranslation()

  // If defaultState changes because dpoInfo changes, then we will render the changes here
  useEffect(() => {
    const dStep = getStateMap(defaultState as ValidState)
    const dStepIndex = steps.findIndex((step) => step === dStep)
    setActiveStep(dStepIndex)
  }, [defaultState, steps])

  const handleStep = (step: number) => () => {
    setActiveStep(step)
    setSelectedState(steps[step])
  }

  const completedStates = useMemo(() => getDpoCompletedStates(dpoInfo), [dpoInfo])

  return (
    <div className={classes.root}>
      <Stepper style={{ padding: '0' }} alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {}
          const buttonProps: { optional?: React.ReactNode } = {}
          return (
            <Step key={label} {...stepProps}>
              <StepButton
                onClick={handleStep(index)}
                {...buttonProps}
                completed={completedStates.includes(label)}
                className={classes.completed}
              >
                <StepLabel StepIconProps={{ classes: { root: classes.root } }}>
                  <SText width="100%" textAlign="center" fontSize="12px" mobileFontSize="10px">
                    {t(label)}
                  </SText>
                </StepLabel>
              </StepButton>
            </Step>
          )
        })}
      </Stepper>
    </div>
  )
}
