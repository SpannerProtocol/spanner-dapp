import BulletTrainBanner from 'assets/images/banner-bullettrain.jpg'
import DexIcon from 'assets/svg/icon-exchange.svg'
import ChartIcon from 'assets/svg/icon-line-chart.svg'
import BN from 'bn.js'
import Card, { BannerCard } from 'components/Card'
import PriceChart from 'components/Chart'
import Divider from 'components/Divider'
import Filter from 'components/Filter'
import { Icon } from 'components/Image'
import { RowBetween } from 'components/Row'
import { Header1, Header2, Header4, HeavyText, ItalicText, SText } from 'components/Text'
import { BorderedWrapper, ContentWrapper, PageWrapper, Section, SpacedSection, Wrapper } from 'components/Wrapper'
import { useProjectPath } from 'hooks/useProject'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import { usePoolsWithToken } from 'hooks/useQueryDexPool'
import useStats from 'hooks/useStats'
import { useSubstrate } from 'hooks/useSubstrate'
import BulletTrainStats from 'pages/BulletTrain/Stats'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import getProjectRegistry from 'utils/getProjectRegistry'

const GridWrapper = styled.div<{ columns?: string; mobileColumns?: string }>`
  display: grid;
  grid-template-columns: auto 3fr;
  grid-column-gap: 1rem;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-column-gap: 0.5rem;
  `};
`

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(40px, 400px) minmax(20px, 50px);
  grid-column-gap: 0.5rem;
  text-align: right;
  width: 100%;
`

function TokenPerformance({ projectInfo }: { projectInfo: ProjectInfo }) {
  const { t } = useTranslation()
  const [priceAvailable, setPriceAvailable] = useState<boolean>(true)
  const [latestPrice, setLatestPrice] = useState<string>('')
  const [token1, token2] = useMemo(() => {
    if (!projectInfo) return [undefined, undefined]
    if (projectInfo.token === 'BOLT') {
      return ['BOLT', 'WUSD']
    } else {
      return ['WUSD', projectInfo.token]
    }
  }, [projectInfo])
  return (
    <>
      {projectInfo && (
        <ContentWrapper>
          <Card>
            <Header2 style={{ display: 'inline-flex' }}>
              <div style={{ display: 'block', maxWidth: '25px', marginRight: '0.5rem' }}>
                <img alt="Price Chart" style={{ display: 'block', width: '100%' }} src={ChartIcon} />
              </div>
              {t(`Token Performance`)}
            </Header2>
            <SpacedSection>
              {latestPrice && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SText>{t(`Current Price`)}</SText>
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
            {token1 && token2 && (
              <PriceChart
                token1={token1}
                token2={token2}
                from={0}
                interval={300}
                setAvailable={setPriceAvailable}
                setLatestPrice={setLatestPrice}
              />
            )}
            {!priceAvailable && <div>{`Price is unavailable for this token`}</div>}
          </Card>
        </ContentWrapper>
      )}
    </>
  )
}

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
  const [filteredAsset, setFilteredAsset] = useState<string>('TravelCabin')

  const stats = useStats(projectPath.token.toUpperCase())

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

  const assetFilter = useMemo(() => {
    const options = ['TravelCabin', 'NFTs (Coming soon)']
    return options.map((label) => ({ label, callback: () => setFilteredAsset(label) }))
  }, [])

  return (
    <>
      <PageWrapper style={{ maxWidth: '680px' }}>
        {projectPath && (
          <>
            <Card borderRadius="0">
              <GridWrapper columns={'2'} mobileColumns={'2'}>
                <Icon src={TokenImage} size="60px" mobileSize="40px" alt="project logo" />
                {projectInfo && (
                  <ContentWrapper>
                    <SpacedSection>
                      <Header1>{projectRegistry.name}</Header1>
                      <ItalicText>{projectRegistry.description}</ItalicText>
                      <SpacedSection>
                        <SText>
                          <b>{t(`Token`)}</b>: {projectInfo.token}
                        </SText>
                        {projectRegistry.name === 'Spanner' ? (
                          <SText>
                            <b>{t(`Total Supply`)}</b>:{` ${'1,000,000,000'}`}
                          </SText>
                        ) : (
                          <SText>
                            <b>{t(`Total Supply`)}</b>:
                            {` ${formatToUnit(projectInfo.totalIssuance.toString(), chainDecimals)}`}
                          </SText>
                        )}
                      </SpacedSection>
                    </SpacedSection>
                  </ContentWrapper>
                )}
              </GridWrapper>
            </Card>
            <Filter
              options={assetFilter}
              activeOption={filteredAsset}
              modalTitle={t(`Filter Asset`)}
              margin="0.25rem"
              filterLabel="Filter by Asset"
            />
            {!noBulletTrain && (
              <ContentWrapper>
                <BannerCard url={BulletTrainBanner} padding="3rem 1rem" darkenBackground>
                  <Header2 colorIsPrimary>{t(`BulletTrain TravelCabins`)}</Header2>
                  <Header4 color="#fff">
                    {`${t(`Earn by depositing your tokens and referring your friends`)}. 
                    ${t(`Click to get more tokens`)}!`}
                  </Header4>
                  <Divider margin="0.5rem 0" />
                  <Section style={{ width: '100%' }}>
                    {projectInfo && <BulletTrainStats token={projectInfo.token} />}
                  </Section>
                </BannerCard>
              </ContentWrapper>
            )}
            {projectInfo && <TokenPerformance projectInfo={projectInfo} />}

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
                  <Card>
                    <Section style={{ marginBottom: '1rem' }}>
                      <Header2 style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'block', maxWidth: '25px', marginRight: '0.5rem' }}>
                          <img alt="Decentralized Exchange" style={{ width: '100%' }} src={DexIcon} />
                        </div>
                        {t(`DEX Metrics`)}
                      </Header2>
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
                                      <SText style={{ textAlign: 'right', width: '100%' }}>
                                        {formatToUnit(pool[1][0], chainDecimals, 2)}
                                      </SText>
                                      <SText style={{ textAlign: 'right' }}>{tokenA}</SText>
                                    </TokenGrid>
                                    <div style={{ display: 'grid' }}>
                                      <TokenGrid>
                                        <SText style={{ textAlign: 'right', width: '100%' }}>
                                          {formatToUnit(pool[1][1], chainDecimals, 2)}
                                        </SText>
                                        <SText style={{ textAlign: 'right' }}>{tokenB}</SText>
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
                  </Card>
                )}
              </Wrapper>
            </ContentWrapper>
          </>
        )}
      </PageWrapper>
    </>
  )
}
