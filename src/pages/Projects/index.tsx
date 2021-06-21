import BulletTrainBanner from 'assets/images/banner-bullettrain.jpg'
import SpannerBanner from 'assets/images/banner-spanner-dark.png'
import { ButtonPrimary } from 'components/Button'
import Card, { BannerCard } from 'components/Card'
import Divider from 'components/Divider'
import { SLink } from 'components/Link'
import { Header1, Header2, Header3, HeavyText, SText } from 'components/Text'
import { CenterWrapper, PageWrapper, SpacedSection } from 'components/Wrapper'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'translate'
import getProjectRegistry, { ProjectRegistry } from 'utils/getProjectRegistry'
import { Tool, Box } from 'react-feather'
import { RowFixed } from 'components/Row'
import { Dispatcher } from 'types/dispatcher'

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

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: minmax(60px, 100px) auto;
  grid-row-gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%;
    grid-template-columns: minmax(40px, 55px) auto;
    grid-template-rows: auto;
    grid-row-gap: 0px;
    grid-column-gap: 1rem;
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

const assetImages: { [key: string]: string } = {
  TravelCabin: BulletTrainBanner,
}

function ProjectsByAssets({ projects }: { projects: ProjectInfo[] }) {
  const { t } = useTranslation()

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
          <div key={asset}>
            <BannerCard url={assetImages[asset]} padding="2rem 1rem">
              <Header2 color="#fff">
                {asset === 'TravelCabin' ? `${t(`BulletTrain`)} ${t(`TravelCabin`)}` : t(asset)}
              </Header2>
            </BannerCard>
            <Header3 padding="1rem 0">{t(`Used by`)}</Header3>
            {projects.map((projectRegistry, index) => (
              <SLink
                key={index}
                to={`/projects/${projectRegistry.token.toLowerCase()}`}
                colorIsBlue
                fontSize="16px"
                mobileFontSize="14px"
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
          </div>
        )
      })}
    </>
  )
}

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
          <div key={index}>
            <ProjectCard>
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
                        <>
                          <SLink
                            key={index}
                            to={`/projects/${project.token.toLowerCase()}`}
                            colorIsBlue
                            fontSize="16px"
                            mobileFontSize="14px"
                          >
                            {asset === 'TravelCabin' ? `${t(`BulletTrain`)} ${t(`TravelCabin`)}` : t(asset)}
                          </SLink>
                        </>
                      ))}
                    </>
                  )}
                </div>
              </ProjectGrid>
            </ProjectCard>
          </div>
        )
      })}
    </>
  )
}

function ProjectCatalogue() {
  const projects = useProjectInfos()
  const [isAsset, setIsAsset] = useState<boolean>(false)

  return (
    <>
      {projects && (
        <ProjectsContainer>
          <AssetProjectToggle setIsAsset={setIsAsset} />
          {isAsset ? <ProjectsByAssets projects={projects} /> : <ProjectsByProjects projects={projects} />}
        </ProjectsContainer>
      )}
    </>
  )
}

function AssetProjectToggle({ setIsAsset }: { setIsAsset: Dispatcher<boolean> }) {
  const [byAsset, setByAsset] = useState<boolean>(false)
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  useEffect(() => {
    setIsAsset(byAsset)
  }, [byAsset, setIsAsset])

  return (
    <>
      <CenterWrapper>
        <div style={{ display: 'block', padding: '1rem 0' }}>
          <SText width="100%" textAlign="center" padding="0">
            {t(`Filter by`)}
          </SText>
          <RowFixed>
            <RowFixed onClick={() => setByAsset(false)} margin="0 1rem" justifyContent="flex-end">
              <Tool size={24} color={theme.gray1} />
              <HeavyText padding="0 0 0 0.5rem" fontSize="16px" mobileFontSize="14px">
                {t(`Project`)}
              </HeavyText>
            </RowFixed>
            <RowFixed onClick={() => setByAsset(true)} margin="0 1rem" justifyContent="flex-start">
              <Box size={18} color={theme.gray1} />
              <HeavyText padding="0 0 0 0.5rem" fontSize="16px" mobileFontSize="14px">
                {t(`Asset`)}
              </HeavyText>
            </RowFixed>
          </RowFixed>
        </div>
      </CenterWrapper>
    </>
  )
}

export default function Projects() {
  const { t } = useTranslation()
  return (
    <>
      <PageWrapper>
        <BannerCard url={SpannerBanner} borderRadius="0" padding="3rem 1rem">
          <Header1 colorIsPrimary>{t(`Projects`)}</Header1>
          <Header2 color="#fff">{t(`Create a token, add assets and grow your community with DPOs`)}</Header2>
          <SpacedSection>
            <SText color="#fff">{t(`Project onboarding available Late Q3, 2021`)}</SText>
          </SpacedSection>
          <SpacedSection margin="2rem 0" mobileMargin="1rem 0">
            <ButtonPrimary disabled>{t(`Create Project`)}</ButtonPrimary>
          </SpacedSection>
        </BannerCard>
      </PageWrapper>
      <ProjectPage>
        <ProjectCatalogue />
      </ProjectPage>
    </>
  )
}
