import { makeStyles } from '@material-ui/core/styles'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useSelectedProject } from '../../hooks/useProject'
import { useTranslation } from 'react-i18next'
import useMilestones from '../../hooks/useMilestones'
import { useSubstrate } from '../../hooks/useSubstrate'
import BN from 'bn.js'
import { BULLETTRAIN_MILESTONES } from '../../constants'
import { FlatCard } from '../../components/Card'
import { HeavyText, SText } from '../../components/Text'
import { RowBetween } from '../../components/Row'
import { formatToUnit } from '../../utils/formatUnit'
import { LinearProgressBar } from '../../components/ProgressBar'


const lineProcessBarStyle = makeStyles({
  root: {
    height: 16,
    borderRadius: 16
  }
})

export function GlobalMilestoneReward() {
  const theme = useContext(ThemeContext)
  const classes = lineProcessBarStyle()
  const project = useSelectedProject()
  const { t } = useTranslation()
  const milestoneInfo = useMilestones(project?.token)
  // const theme = useContext(ThemeContext)
  const { chainDecimals } = useSubstrate()
  const [progress, setProgress] = useState<number>(0)


  const sortedMilestones = useMemo(() => {
    if (milestoneInfo) {
      const milestones = milestoneInfo.milestones
      return milestones.sort((m1, m2) => {
        if (m1[0].sub(m2[0]).isNeg()) {
          return -1
        } else if (!m1[0].sub(m2[0]).isNeg()) {
          return 1
        } else {
          return 0
        }
      })
    }
  }, [milestoneInfo])

  const nextMilestone = useMemo(() => {
    if (sortedMilestones && milestoneInfo) {
      return sortedMilestones.find((milestone) => milestoneInfo.deposited.lt(milestone[0]))
    }
  }, [sortedMilestones, milestoneInfo])

  const rewardsData = useMemo(() => {
    if (!milestoneInfo) return
    const cd = new BN(chainDecimals)
    const deposited = milestoneInfo.deposited.div(new BN(10).pow(cd)).toNumber()
    let finishedRewards = 0
    let totalPercent = 0
    let finishedPercent = 0
    const progressArray = []

    if (milestoneInfo) {
      for (const milestone of BULLETTRAIN_MILESTONES) {
        if (deposited > milestone[0]) {
          finishedRewards = finishedRewards + milestone[1]
          finishedPercent = finishedPercent + (milestone[1] / milestone[0]) * 100
          progressArray.push({
            milestone: milestone[0],
            reward: milestone[1],
            finished: true
          })
        } else {
          progressArray.push({
            milestone: milestone[0],
            reward: milestone[1],
            finished: false
          })
        }
        totalPercent = totalPercent + (milestone[1] / milestone[0]) * 100
      }
    }
    return { finishedRewards, finishedPercent, totalPercent, progressArray }
  }, [milestoneInfo, chainDecimals])

  // get progress for current milestone
  useEffect(() => {
    if (!nextMilestone || !milestoneInfo) return
    const cd = new BN(chainDecimals)
    const deposited = milestoneInfo.deposited.div(new BN(10).pow(cd))
    const nextTarget = nextMilestone[0].div(new BN(10).pow(cd))
    setProgress((deposited.toNumber() / nextTarget.toNumber()) * 100)
  }, [nextMilestone, milestoneInfo, chainDecimals])


  return (
    <>
      {milestoneInfo && nextMilestone && project && chainDecimals && (
        <FlatCard style={{ textAlign: 'left' }}>
          <HeavyText fontSize={'14px'}
                     mobileFontSize={'14px'}>{'Global Milestone Reward'}</HeavyText>
          <HeavyText fontSize={'20px'} mobileFontSize={'20px'} color={theme.primary1} padding={'2rem 0rem 1rem 0rem'}
                     style={{ margin: 'auto',textAlign: 'center' }}>{`${rewardsData?.finishedRewards.toString()} BOLT`}</HeavyText>
          <SText fontSize={'14px'} mobileFontSize={'14px'} padding={'0rem 0rem 3rem 0rem'}
                        style={{ margin: 'auto',textAlign: 'center' }}>{'Total Milestone Reward Distributed'}</SText>
          <RowBetween>
            <SText fontSize={'12px'} mobileFontSize={'12px'}>
              {`${t(`Current`)}: ${formatToUnit(milestoneInfo.deposited.toBn(), chainDecimals, 3, true)}`}
            </SText>
            <SText fontSize={'12px'} mobileFontSize={'12px'} style={{textAlign:'right'}}>
              {`${t(`Milestone`)}: ${formatToUnit(nextMilestone[0].toBn(), chainDecimals, 1, true)} ${project.token}`}
            </SText>
          </RowBetween>

          <div style={{ margin: '1rem 0rem' }}>
            <LinearProgressBar color={'secondary'} classes={{ root: classes.root }}
                               value={parseFloat(progress.toFixed(0))} />
          </div>
          <HeavyText style={{ margin: 'auto' }} fontSize={'12px'} mobileFontSize={'12px'} width={'fit-content'}
                     padding={'1rem 0rem'}>{'Get involved and get more rewards'}</HeavyText>
        </FlatCard>
      )}
    </>
  )
}
