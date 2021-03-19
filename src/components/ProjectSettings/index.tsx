import Selector, { SelectorOption } from 'components/Selector'
import useProjectInfos from 'hooks/useProjectInfo'
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import { Project } from '../../state/project/actions'
import { useProjectState } from 'state/project/hooks'
import { useTranslation } from 'react-i18next'

export interface ProjectSettingsProps {
  setSelectedProject: (project: Project) => void
}

export default function ProjectSettings({ setSelectedProject }: ProjectSettingsProps) {
  const theme = useContext(ThemeContext)
  const projects = useProjectInfos()
  const [projectOptions, setProjectOptions] = useState<Array<SelectorOption>>()
  const projectState = useProjectState()
  const { t } = useTranslation()
  const selectedProject = projectState.selectedProject

  useEffect(() => {
    if (!projects) return
    const options = projects.map((project) => ({
      label: `${project.project} (${project.token})`,
      callback: () =>
        setSelectedProject({
          project: project.project,
          token: project.token,
          totalIssuance: project.totalIssuance.toString(),
        }),
    }))
    setProjectOptions(options)
  }, [projects, setSelectedProject])

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed>
          <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
            {t(`Selected Project`)}
          </TYPE.black>
          <QuestionHelper text={t(`You can switch projects to view data specific to that project (in most views).`)} />
        </RowFixed>
        <RowBetween>
          {projectOptions && selectedProject && (
            <Selector
              title={t(`Select a Project`)}
              options={projectOptions}
              defaultOption={{
                label: selectedProject.project,
              }}
            />
          )}
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
