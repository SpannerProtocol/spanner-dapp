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

// const ProjectsContainer = styled.div`
//   display: grid;
//   grid-template-columns: auto auto auto auto;
//   grid-column-gap: 40px;
//   grid-row-gap: 40px;
//   align-items: center;
//   justify-content: center;
//
//   ${({ theme }) => theme.mediaWidth.upToMedium`
//     padding: 1rem;
//   `};
//
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     padding: 1rem;
//     grid-template-columns: auto auto;
//     grid-column-gap: 40px;
//   `};
//
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     width: 100%;
//     display: block;
//     padding: 1rem;
//   `};
// `

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

// const ProjectPage = styled(PageWrapper)`
//   width: 100%;
//   max-width: 960px;
//   justify-content: center;
//   align-items: center;
//   margin-top: 140px;
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     margin-top: 0;
//   `};
// `

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

function ProjectsByAssets({ projects }: { projects: ProjectInfo[] }) {
  const assets = useMemo(() => {
    const assetMap: { [key: string]: ProjectRegistry[] } = {}
    projects.forEach((project) => {
      const projectRegistry = getProjectRegistry(project.token.toLowerCase())[0]
      const projectAssets = projectRegistry.assets
      projectAssets.forEach((asset) => {
        if (Object.keys(assetMap).includes(asset)) {
          assetMap[asset].push(projectRegistry)
        } else {
          assetMap[asset] = [projectRegistry]
        }
      })
    })
    return assetMap
  }, [projects])

  return (
    <>
      {Object.keys(assets).map((asset) => {
        const projects = assets[asset]
        return (
          <>
            {projects.map((projectRegistry, index) => (
              <SLink
                key={index}
                to={`/projects/${projectRegistry.token.toLowerCase()}?asset=${asset}`}
                colorIsBlue
                fontSize="16px"
                mobileFontSize="14px"
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
      })}
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
        {projects && <ProjectsByAssets projects={projects} />}
      </PageWrapper>
    </>
  )
}
