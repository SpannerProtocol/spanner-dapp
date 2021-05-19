import BN from 'bn.js'
import { LinearProgressBar } from 'components/ProgressBar'
import QuestionHelper, { AnyQuestionHelper } from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { HeavyText, StandardText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import useMilestones from 'hooks/useMilestones'
import { useSelectedProject } from 'hooks/useProject'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'
import { BULLETTRAIN_MILESTONES } from '../../constants'

export default function Milestones() {
  const project = useSelectedProject()
  const milestoneInfo = useMilestones(project?.token)
  // const theme = useContext(ThemeContext)
  const { chainDecimals } = useSubstrate()
  const [progress, setProgress] = useState<number>(0)
  const { t } = useTranslation()

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
            finished: true,
          })
        } else {
          progressArray.push({
            milestone: milestone[0],
            reward: milestone[1],
            finished: false,
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
        <>
          <div style={{ display: 'flex', paddingBottom: '0.35rem', alignItems: 'center' }}>
            <HeavyText fontSize="14px">{t(`Global Milestone Reward`)}</HeavyText>
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(
                `Upon achieving milestone targets, the reward will be distributed to all passengers that have purchased a TravelCabin.`
              )}
            />
          </div>
          {rewardsData && rewardsData.finishedRewards !== 0 && (
            <>
              <SpacedSection mobileMargin="0.2rem 0">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <StandardText fontSize="16px" mobileFontSize="11px">
                    {String.fromCodePoint(0x1f389)} {t(`Congrats!! Total of`)}{' '}
                    <b>{`${rewardsData.finishedPercent.toFixed(2)}% `}</b>{' '}
                    {t(`given to all passengers. Don't miss out!`)}!{String.fromCodePoint(0x1f389)}
                  </StandardText>
                </div>
              </SpacedSection>
              <SpacedSection mobileMargin="0.2rem 0">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {rewardsData.progressArray.map((milestone) => (
                    <>
                      {milestone.finished ? (
                        <AnyQuestionHelper
                          text={`${t(`Finished! Distributed `)} ${(
                            (milestone.reward / milestone.milestone) *
                            100
                          ).toFixed(2)}% ${t(`to all passengers`)}.`}
                        >
                          <StandardText fontSize="20px" mobileFontSize="14px" padding="0 0.1rem">
                            {String.fromCodePoint(0x2705)}
                          </StandardText>
                        </AnyQuestionHelper>
                      ) : (
                        <AnyQuestionHelper
                          text={`${((milestone.reward / milestone.milestone) * 100).toFixed(2)}% ${t(
                            `will be given to all passengers when hitting the Milestone of`
                          )}: ${milestone.milestone.toLocaleString()} ${project.token} `}
                        >
                          <StandardText fontSize="20px" mobileFontSize="14px" padding="0 0.1rem">
                            {String.fromCodePoint(0x1f381)}
                          </StandardText>
                        </AnyQuestionHelper>
                      )}
                    </>
                  ))}
                </div>
              </SpacedSection>
            </>
          )}
          <SpacedSection>
            <RowBetween>
              <StandardText fontSize="11px">
                {`${t(`Progress`)}: ${formatToUnit(milestoneInfo.deposited.toBn(), chainDecimals, 3, true)}`}
              </StandardText>
              <StandardText fontSize="11px">
                {`${t(`Milestone`)}: ${formatToUnit(nextMilestone[0].toBn(), chainDecimals, 1, true)} ${project.token}`}
              </StandardText>
            </RowBetween>
            <div style={{ display: 'block', width: '100%', borderRadius: '12px' }}>
              <LinearProgressBar color={'secondary'} value={parseFloat(progress.toFixed(0))} />
            </div>
          </SpacedSection>
        </>
      )}
    </>
  )
}
