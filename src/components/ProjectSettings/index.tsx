import Selector, { SelectorOption } from 'components/Selector'
import { BorderedWrapper } from 'components/Wrapper'
import { ProjectData, useProject } from 'hooks/useProject'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectState } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import getProjectRegistry from '../../utils/getProjectRegistry'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'

export interface ProjectSettingsProps {
  setSelectedProject: (project: ProjectData) => void
}

export default function ProjectSettings({ setSelectedProject }: ProjectSettingsProps) {
  const theme = useContext(ThemeContext)
  const projects = useProject()
  const [projectOptions, setProjectOptions] = useState<Array<SelectorOption>>()
  const projectState = useProjectState()
  const { t } = useTranslation()

  const selectedProject = useMemo(
    () =>
      projectState.selectedProject ? getProjectRegistry(projectState.selectedProject.token.toLocaleLowerCase()) : [],
    [projectState]
  )

  useEffect(() => {
    if (!projects) return
    const options = projects.map((project) => ({
      label: `${project.name} (${project.token})`,
      icon: project.icon,
      callback: () =>
        setSelectedProject({
          name: project.name,
          token: project.token,
          description: project.description,
          icon: project.icon,
          totalIssuance: project.totalIssuance,
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
          <BorderedWrapper padding="0" marginTop="0" marginBottom="0">
            {projectOptions && selectedProject.length > 0 && (
              <Selector
                title={t(`Select a Project`)}
                options={projectOptions}
                defaultOption={{
                  label: `${selectedProject[0].name} (${selectedProject[0].token.toUpperCase()})`,
                }}
                selectedIconMaxWidth={'20px'}
                selectedIconMaxWidthMobile={'20px'}
              />
            )}
          </BorderedWrapper>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
