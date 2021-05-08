import { FlatCard } from 'components/Card'
import { StandardText, SectionHeading, Heading, ItalicText, HeavyText } from 'components/Text'
import { BorderedWrapper, ContentWrapper, PageWrapper, Section, SpacedSection, Wrapper } from 'components/Wrapper'
import { useProjectPath } from 'hooks/useProject'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import { useSubstrate } from 'hooks/useSubstrate'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import getProjectRegistry from 'utils/getProjectRegistry'
import BulletTrainImage from 'assets/images/bullettrain-vector.png'
import DexIcon from 'assets/svg/icon-exchange.svg'
import BulletTrainIcon from 'assets/svg/icon-train-yellow.svg'
import ChartIcon from 'assets/svg/icon-line-chart.svg'
import BulletTrainStats from 'pages/BulletTrain/Stats'
import { useTranslation } from 'react-i18next'
import { usePoolsWithToken } from 'hooks/useQueryDexPool'
import { RowBetween } from 'components/Row'
import PriceChart from 'components/Chart'
import useStats from 'hooks/useStats'
import BN from 'bn.js'

const GridWrapper = styled.div<{ columns?: string; mobileColumns?: string }>`
  display: grid;
  grid-template-columns: auto 3fr;
  grid-column-gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-column-gap: 0.5rem;
  `};
`

const ProjectIconWrapper = styled.div`
  display: flex;
  max-width: 120px;
  justify-content: center;
  padding: 1rem;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    max-width: 80px;
    padding: 0.5rem;
  `};
`

const BannerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 4fr));
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display:grid;
  grid-template-columns: repeat(1, minmax(0, 4fr));
  `};
`

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(40px, 400px) minmax(20px, 50px);
  grid-column-gap: 0.5rem;
  text-align: right;
  width: 100%;
`

export default function Project(): JSX.Element {
  const projectPath = useProjectPath()
  const projectInfos = useProjectInfos()
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>()
  const { chainDecimals } = useSubstrate()
  const projectRegistry = getProjectRegistry(projectPath.token)[0]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const TokenImage = require(`assets/tokens/${projectRegistry.icon}`)
  const { t } = useTranslation()
  const dexPools = usePoolsWithToken(projectPath.token)
  const [priceUnavailable, setPriceUnavailable] = useState<boolean>(false)
  const stats = useStats(projectPath.token.toUpperCase())
  const [latestPrice, setLatestPrice] = useState<string>('')

  const noBulletTrain =
    stats.totalCabinsBought === 0 &&
    stats.totalPassengers === 0 &&
    stats.totalValueLocked.eq(new BN(0)) &&
    stats.totalYieldWithdrawn.eq(new BN(0))

  useEffect(() => {
    if (!projectInfos) return
    const currentProject = projectInfos.find((project) => project.token.toLowerCase() === projectPath.token)
    setProjectInfo(currentProject)
  }, [projectInfos, projectPath])

  return (
    <>
      <PageWrapper style={{ maxWidth: '680px' }}>
        {projectPath && (
          <>
            <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Heading style={{ paddingTop: '0.5rem' }}>{t(`Project Info`)}</Heading>
              <GridWrapper columns={'2'} mobileColumns={'2'}>
                <BorderedWrapper style={{ display: 'flex' }}>
                  <ProjectIconWrapper>
                    <img src={TokenImage} style={{ width: '100%' }} alt="project logo" />
                  </ProjectIconWrapper>
                </BorderedWrapper>
                {projectInfo && (
                  <ContentWrapper>
                    <SpacedSection>
                      <SectionHeading>{projectRegistry.name}</SectionHeading>
                      <ItalicText>{projectRegistry.description}</ItalicText>
                      <SpacedSection>
                        <StandardText>
                          <b>{t(`Token`)}</b>: {projectInfo.token}
                        </StandardText>
                        {projectRegistry.name === 'Spanner' ? (
                          <StandardText>
                            <b>{t(`Total Supply`)}</b>:{` ${'1,000,000,000'}`}
                          </StandardText>
                        ) : (
                          <StandardText>
                            <b>{t(`Total Supply`)}</b>:
                            {` ${formatToUnit(projectInfo.totalIssuance.toString(), chainDecimals)}`}
                          </StandardText>
                        )}
                      </SpacedSection>
                    </SpacedSection>
                  </ContentWrapper>
                )}
              </GridWrapper>
            </FlatCard>

            {projectInfo && !priceUnavailable && (
              <ContentWrapper>
                <FlatCard>
                  <SectionHeading style={{ display: 'inline-flex' }}>
                    <div style={{ display: 'block', maxWidth: '25px', marginRight: '0.5rem' }}>
                      <img alt="Price Chart" style={{ display: 'block', width: '100%' }} src={ChartIcon} />
                    </div>
                    {t(`Token Performance`)}
                  </SectionHeading>
                  <SpacedSection>
                    {latestPrice && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <StandardText>{t(`Current Price`)}</StandardText>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <HeavyText fontSize="28px" mobileFontSize="24px" style={{ paddingRight: '1rem' }}>
                            ${latestPrice}
                          </HeavyText>
                          <HeavyText>{`${projectInfo.token.toUpperCase()} / WUSD `}</HeavyText>
                        </div>
                      </>
                    )}
                  </SpacedSection>
                  <PriceChart
                    token1={projectInfo.token.toUpperCase()}
                    token2={'WUSD'}
                    from={0}
                    interval={300}
                    setUnavailable={setPriceUnavailable}
                    setLatestPrice={setLatestPrice}
                  />
                </FlatCard>
              </ContentWrapper>
            )}

            {!noBulletTrain && (
              <ContentWrapper>
                <Wrapper
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FlatCard>
                    <Section style={{ marginBottom: '1rem' }}>
                      <SectionHeading style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'block', maxWidth: '25px', marginRight: '0.5rem' }}>
                          <img
                            alt="BulletTrain icon"
                            style={{ display: 'block', width: '100%' }}
                            src={BulletTrainIcon}
                          />
                        </div>
                        {t(`BulletTrain Performance`)}
                      </SectionHeading>
                    </Section>
                    <Section style={{ width: '100%' }}>
                      <BannerGrid style={{ width: '100%', marginBottom: '1rem' }}>
                        <div style={{ maxWidth: '250px', justifyContent: 'left' }}>
                          <img alt="BulletTrain banner" style={{ width: '100%' }} src={BulletTrainImage} />
                        </div>
                        {projectInfo && <BulletTrainStats token={projectInfo.token} />}
                      </BannerGrid>
                    </Section>
                  </FlatCard>
                </Wrapper>
              </ContentWrapper>
            )}

            <ContentWrapper>
              <Wrapper
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {dexPools.length > 0 && (
                  <FlatCard>
                    <Section style={{ marginBottom: '1rem' }}>
                      <SectionHeading style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'block', maxWidth: '25px', marginRight: '0.5rem' }}>
                          <img alt="Decentralized Exchange" style={{ width: '100%' }} src={DexIcon} />
                        </div>
                        {t(`DEX Metrics`)}
                      </SectionHeading>
                    </Section>
                    <Section>
                      <HeavyText style={{ marginBottom: '1rem' }}>{t(`Liquidity Pools`)}</HeavyText>
                      {dexPools.map((pool, index) => {
                        const tokenA = pool[0][0][0].asToken.toString()
                        const tokenB = pool[0][0][1].asToken.toString()
                        const pair = `${tokenA} / ${tokenB}`
                        return (
                          <div key={index}>
                            {pool && (
                              <BorderedWrapper
                                padding="0.7rem"
                                style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}
                              >
                                <RowBetween>
                                  <HeavyText style={{ width: '100%' }}>{pair}</HeavyText>
                                  <div style={{ display: 'grid' }}>
                                    <TokenGrid>
                                      <StandardText style={{ textAlign: 'right', width: '100%' }}>
                                        {formatToUnit(pool[1][0], chainDecimals, 2)}
                                      </StandardText>
                                      <StandardText style={{ textAlign: 'right' }}>{tokenA}</StandardText>
                                    </TokenGrid>
                                    <div style={{ display: 'grid' }}>
                                      <TokenGrid>
                                        <StandardText style={{ textAlign: 'right', width: '100%' }}>
                                          {formatToUnit(pool[1][1], chainDecimals, 2)}
                                        </StandardText>
                                        <StandardText style={{ textAlign: 'right' }}>{tokenB}</StandardText>
                                      </TokenGrid>
                                    </div>
                                  </div>
                                </RowBetween>
                              </BorderedWrapper>
                            )}
                          </div>
                        )
                      })}
                    </Section>
                  </FlatCard>
                )}
              </Wrapper>
            </ContentWrapper>
          </>
        )}
      </PageWrapper>
    </>
  )
}
