import BulletTrainBanner from 'assets/images/banner-bullettrain.jpg'
import Card, { BannerCard } from 'components/Card'
import { SLink } from 'components/Link'
import { Header1, Header2, SText } from 'components/Text'
import { PageWrapper } from 'components/Wrapper'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'translate'
import getProjectRegistry, { ProjectRegistry } from 'utils/getProjectRegistry'

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(40px, 55px) auto;
  grid-template-rows: auto;
  grid-row-gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%;
    grid-template-columns: minmax(40px, 55px) auto;
    grid-template-rows: auto;
    grid-row-gap: 0px;
    grid-column-gap: 1rem;
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

const ProjectCard = styled(Card)`
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
    transform: translate(0, -5px);
  }
  margin: 1rem 0;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  margin: 0.5rem 0;
`};
`

function ProjectsByBulletTrain({ projects }: { projects: ProjectInfo[] }) {
  const bulletTrainProjects = useMemo(() => {
    const projectsWithBulletTrain: ProjectRegistry[] = []
    projects.forEach((project) => {
      const projectRegistry = getProjectRegistry(project.token.toLowerCase())[0]
      if (projectRegistry.assets.includes('TravelCabin')) {
        projectsWithBulletTrain.push(projectRegistry)
      }
    })
    return projectsWithBulletTrain
  }, [projects])

  return (
    <>
      {bulletTrainProjects.map((projectRegistry, index) => (
        <SLink
          key={index}
          to={`/projects/${projectRegistry.token.toLowerCase()}?asset=TravelCabin`}
          colorIsBlue
          fontSize="14px"
          width="100%"
        >
          <ProjectCard>
            <ProjectGrid>
              <ProjectIconWrapper>
                <img src={require(`assets/tokens/${projectRegistry.icon}`)} width="100%" alt="token icon" />
              </ProjectIconWrapper>
              <div>
                <Header2>{projectRegistry.name}</Header2>
                <SText width="100%">{projectRegistry.token.toUpperCase()}</SText>
              </div>
            </ProjectGrid>
          </ProjectCard>
        </SLink>
      ))}
    </>
  )
}

export default function BulletTrains() {
  const { t } = useTranslation()
  const projects = useProjectInfos()
  return (
    <>
      <PageWrapper>
        <BannerCard url={BulletTrainBanner} borderRadius="0" padding="3rem 1rem">
          <Header1 colorIsPrimary>{t(`BulletTrain`)}</Header1>
          <Header2 color="#fff">
            {t(`Earn token rewards by buying TravelCabins or crowdfund for them with DPOs`)}
          </Header2>
        </BannerCard>
        {projects && <ProjectsByBulletTrain projects={projects} />}
      </PageWrapper>
    </>
  )
}
