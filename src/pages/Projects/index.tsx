import SpannerBanner from 'assets/images/banner-spanner-dark.png'
import { ButtonPrimary } from 'components/Button'
import Card, { BannerCard } from 'components/Card'
import Divider from 'components/Divider'
import { SLink } from 'components/Link'
import { Header1, Header2, Header3, SText } from 'components/Text'
import { PageWrapper, SpacedSection } from 'components/Wrapper'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'translate'
import getProjectRegistry from 'utils/getProjectRegistry'

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

function ProjectsByProjects({ projects }: { projects: ProjectInfo[] }) {
  const { t } = useTranslation()
  return (
    <>
      {projects.map((project, index) => {
        const projectRegistry = getProjectRegistry(project.token.toLowerCase())[0]
        if (projectRegistry.description === '') return <div key={index}></div>
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const TokenImage = require(`assets/tokens/${projectRegistry.icon}`)
        const numAssets = projectRegistry.assets.length
        return (
          <ProjectCard key={index}>
            <ProjectGrid>
              <ProjectIconWrapper>
                <img src={TokenImage} width="100%" alt="token icon" />
              </ProjectIconWrapper>
              <div>
                <Header2>{projectRegistry.name}</Header2>
                <SText width="100%">{project.token}</SText>
                {numAssets > 0 && (
                  <>
                    <Divider margin="0.5rem 0" />
                    <Header3>{t(`Assets`)}</Header3>
                    {projectRegistry.assets.map((asset, index) => (
                      <SLink
                        key={index}
                        to={`/projects/${project.token.toLowerCase()}?asset=${asset}`}
                        colorIsBlue
                        fontSize="16px"
                        mobileFontSize="14px"
                      >
                        {asset === 'TravelCabin' ? `${t(`BulletTrain`)} ${t(`TravelCabin`)}` : t(asset)}
                      </SLink>
                    ))}
                  </>
                )}
              </div>
            </ProjectGrid>
          </ProjectCard>
        )
      })}
    </>
  )
}

function ProjectCatalogue() {
  const projects = useProjectInfos()

  return <>{projects && <ProjectsByProjects projects={projects} />}</>
}

export default function Projects() {
  const { t } = useTranslation()
  return (
    <>
      <PageWrapper>
        <BannerCard url={SpannerBanner} borderRadius="0" padding="3rem 1rem" margin="0 0 1rem 0">
          <Header1 colorIsPrimary>{t(`Projects`)}</Header1>
          <Header2 color="#fff">{t(`Create a token, add assets and grow your community with DPOs`)}</Header2>
          <SpacedSection>
            <SText color="#fff">{t(`Project onboarding available Late Q3, 2021`)}</SText>
          </SpacedSection>
          <SpacedSection margin="2rem 0" mobileMargin="1rem 0">
            <ButtonPrimary disabled>{t(`Create Project`)}</ButtonPrimary>
          </SpacedSection>
        </BannerCard>
        <ProjectCatalogue />
      </PageWrapper>
    </>
  )
}
