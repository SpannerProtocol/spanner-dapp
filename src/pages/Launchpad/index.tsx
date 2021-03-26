import { FlatCardPlate } from 'components/Card'
import { HeavyText, StandardText } from 'components/Text'
import { PageWrapper } from 'components/Wrapper'
import useProjectInfos from 'hooks/useProjectInfo'
import React from 'react'
import styled from 'styled-components'
import getTokenImagePaths from 'utils/getTokenImage'

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
    padding-left: 3rem;
    padding-right: 3rem;
  `};
`

const ProjectIconWrapper = styled.div`
  max-width: 120px;
  justify-content: center;
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    max-width: 80px;
    padding: 0.25rem;
  `};
`

const ProjectCardPlate = styled(FlatCardPlate)`
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
            console.log(project)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const TokenImage = require(`assets/tokens/${getTokenImagePaths(project.token.toLowerCase())[0].path}`)

            return (
              <>
                <ProjectCardPlate
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <ProjectCard key={index}>
                    <ProjectIconWrapper>
                      <img src={TokenImage} style={{ width: '100%' }} />
                    </ProjectIconWrapper>
                    <div style={{ textAlign: 'center' }}>
                      <HeavyText>{project.project}</HeavyText>
                      <StandardText>{project.token}</StandardText>
                    </div>
                  </ProjectCard>
                </ProjectCardPlate>
              </>
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
