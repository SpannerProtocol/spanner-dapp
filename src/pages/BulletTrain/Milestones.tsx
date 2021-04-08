import { StandardText } from 'components/Text'
import { BorderedWrapper } from 'components/Wrapper'
import useMilestones from 'hooks/useMilestones'
import { useSelectedProject } from 'hooks/useProject'
import React, { useMemo } from 'react'

// const MilestoneWrapper = styled.div``

export default function Milestones() {
  const project = useSelectedProject()
  const milestoneInfo = useMilestones(project?.token)

  const nextMilestone = useMemo(
    () => milestoneInfo && milestoneInfo.milestones.find((milestone) => milestoneInfo.deposited.lt(milestone[0])),
    [milestoneInfo]
  )

  return (
    <>
      {nextMilestone && project && (
        <>
          <StandardText>Next Milestone Target</StandardText>
          <BorderedWrapper>
            {nextMilestone[0].toString()} {project.token}
          </BorderedWrapper>
        </>
      )}
    </>
  )
}
