import Selector, { SelectorOption } from 'components/Selector'
import { StandardText } from 'components/Text'
import { BorderedWrapper } from 'components/Wrapper'
import { ProjectData, useProject } from 'hooks/useProject'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectState, useSelectProject } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import getProjectRegistry from '../../utils/getProjectRegistry'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowFixed } from '../Row'

export interface ProjectSettingsProps {
  setSelectedProject: (project: ProjectData) => void
}

export default function ProjectSettings({ backgroundColor }: { backgroundColor?: string }) {
  const theme = useContext(ThemeContext)
  const projects = useProject()
  const [projectOptions, setProjectOptions] = useState<Array<SelectorOption>>()
  const projectState = useProjectState()
  const { t } = useTranslation()
  const selectProject = useSelectProject()

  const handleSelectProject = useCallback(
    (project: ProjectData) => {
      selectProject({ project: project.name, token: project.token, totalIssuance: project.totalIssuance.toString() })
    },
    [selectProject]
  )

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
        handleSelectProject({
          name: project.name,
          token: project.token,
          description: project.description,
          icon: project.icon,
          totalIssuance: project.totalIssuance,
        }),
    }))
    setProjectOptions(options)
  }, [projects, handleSelectProject])

  return (
    <AutoColumn>
      <RowFixed>
        <StandardText fontSize={'12px'} color={theme.text2}>
          {t(`Filter Project`)}
        </StandardText>
        <QuestionHelper
          text={t(`You can switch projects to view data specific to that project (in most views).`)}
          backgroundColor="transparent"
          size={12}
        />
      </RowFixed>
      <BorderedWrapper padding="0" marginTop="0" marginBottom="0">
        {projectOptions && selectedProject.length > 0 && (
          <Selector
            title={t(`Select a Project`)}
            options={projectOptions}
            defaultOption={{
              label: `${selectedProject[0].name} (${selectedProject[0].token.toUpperCase()})`,
            }}
            backgroundColor={backgroundColor}
            selectedIconMaxWidth={'20px'}
            selectedIconMaxWidthMobile={'20px'}
          />
        )}
      </BorderedWrapper>
    </AutoColumn>
  )
}
