import BN from 'bn.js'
import { ProgressBar2 } from 'components/ProgressBar'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { StandardText, HeavyText } from 'components/Text'
import useMilestones from 'hooks/useMilestones'
import { useSelectedProject } from 'hooks/useProject'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'

export default function Milestones() {
  const project = useSelectedProject()
  const milestoneInfo = useMilestones(project?.token)
  const theme = useContext(ThemeContext)
  const { chainDecimals } = useSubstrate()
  const [progress, setProgress] = useState<number>(0)
  const { t } = useTranslation()

  const nextMilestone = useMemo(() => {
    if (milestoneInfo) {
      const milestones = milestoneInfo.milestones
      const sorted = milestones.sort((m1, m2) => {
        if (m1[0].sub(m2[0]).isNeg()) {
          return -1
        } else if (!m1[0].sub(m2[0]).isNeg()) {
          return 1
        } else {
          return 0
        }
      })
      return sorted.find((milestone) => milestoneInfo.deposited.lt(milestone[0]))
    }
  }, [milestoneInfo])

  useEffect(() => {
    if (!nextMilestone || !milestoneInfo) return
    const cd = new BN(chainDecimals)
    const deposited = milestoneInfo.deposited.div(cd)
    const nextTarget = nextMilestone[0].div(cd)
    setProgress(deposited.toNumber() / nextTarget.toNumber())
  }, [nextMilestone, milestoneInfo, chainDecimals])

  return (
    <>
      {milestoneInfo && nextMilestone && project && chainDecimals && (
        <>
          <div style={{ display: 'flex', paddingBottom: '0.35rem' }}>
            <HeavyText fontSize="14px">{t(`Global Milestone Reward`)}</HeavyText>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(
                `Upon achieving milestone targets, the reward will be distributed to all passengers that have purchased a TravelCabin.`
              )}
            />
          </div>
          <RowBetween>
            <StandardText fontSize="11px">
              {`${t(`Progress`)}: ${formatToUnit(
                milestoneInfo.deposited.toBn(),
                chainDecimals,
                1,
                true
              )} / ${formatToUnit(nextMilestone[0].toBn(), chainDecimals, 1, true)} ${project.token}`}
            </StandardText>
            <StandardText fontSize="11px">
              {`${t(`Total Rewards`)}: ${formatToUnit(nextMilestone[1].toBn(), chainDecimals, 1, true)} ${
                project.token
              }`}
            </StandardText>
          </RowBetween>
          <div style={{ display: 'block', width: '100%', borderRadius: '12px' }}>
            <ProgressBar2
              type={'line'}
              percent={parseFloat(progress.toFixed(1))}
              strokeColor={{
                '0%': theme.primary1,
                '100%': theme.secondary1,
              }}
              status={'active'}
              strokeLinecap={'round'}
              trailColor={theme.text5}
              size={'default'}
              showInfo={false}
            />
          </div>
        </>
      )}
    </>
  )
}
