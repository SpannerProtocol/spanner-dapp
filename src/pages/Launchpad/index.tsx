import { FlatCard } from 'components/Card'
import { HeavyText, StandardText } from 'components/Text'
import { PageWrapper } from 'components/Wrapper'
import useProjectInfos from 'hooks/useProjectInfo'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import getProjectRegistry from 'utils/getProjectRegistry'

const ProjectsContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
    grid-template-columns: auto auto;
    grid-column-gap: 40px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%;
    display: block;
    padding: 1rem;
  `};
`

const ProjectCard = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: minmax(60px, 100px) auto;
  grid-row-gap: 10px;
  align-items: center;
  margin: 1rem;
  // transition: background-color 0.3s ease-in;
  // &:hover {
  //   background: ${({ theme }) => theme.primary1};
  // }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 0;
    width: 100%;
    grid-template-columns: minmax(40px, 55px) auto;
    grid-template-rows: auto;
    grid-row-gap: 0px;
    grid-column-gap: 0px;
    padding: 0.5rem;
  `};
`

const ProjectPage = styled(PageWrapper)`
  width: 100%;
  max-width: 960px;
  justify-content: center;
  align-items: center;
  margin-top: 140px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 0;
  `};
`

export const ProjectIconWrapper = styled.div`
  max-width: 120px;
  justify-content: center;
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    max-width: 80px;
    padding: 0.25rem;
  `};
`

const ProjectCardPlate = styled(FlatCard)`
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
    transform: translate(0, -5px);
  }
`

function ProjectCatalogue() {
  const projects = useProjectInfos()
  return (
    <>
      <ProjectsContainer>
        {projects &&
          projects.map((project, index) => {
            const projectRegistry = getProjectRegistry(project.token.toLowerCase())[0]
            if (projectRegistry.description === '') return <div key={index}></div>
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const TokenImage = require(`assets/tokens/${projectRegistry.icon}`)
            return (
              <div key={index}>
                <Link
                  key={index}
                  to={{ pathname: `/launchpad/${project.token.toLowerCase()}` }}
                  style={{ textDecoration: 'none' }}
                >
                  <ProjectCardPlate
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <ProjectCard>
                      <ProjectIconWrapper>
                        <img src={TokenImage} style={{ width: '100%' }} alt="token icon" />
                      </ProjectIconWrapper>
                      <div style={{ textAlign: 'center' }}>
                        <HeavyText style={{ width: '100%' }}>{projectRegistry.name}</HeavyText>
                        <StandardText style={{ width: '100%' }}>{project.token}</StandardText>
                      </div>
                    </ProjectCard>
                  </ProjectCardPlate>
                </Link>
              </div>
            )
          })}
      </ProjectsContainer>
    </>
  )
}

export default function Launchpad() {
  return (
    <>
      <ProjectPage>
        <ProjectCatalogue />
      </ProjectPage>
    </>
  )
}
