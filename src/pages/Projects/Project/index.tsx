import BN from 'bn.js'
import Card from 'components/Card'
import Filter from 'components/Filter'
import { Icon } from 'components/Image'
import { Header1, ItalicText, SText } from 'components/Text'
import { ContentWrapper, PageWrapper, SpacedSection } from 'components/Wrapper'
import { usePathProject } from 'hooks/usePath'
import useProjectInfos, { ProjectInfo } from 'hooks/useProjectInfo'
import useStats from 'hooks/useStats'
import { useSubstrate } from 'hooks/useSubstrate'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import getProjectRegistry from 'utils/getProjectRegistry'
import AssetTravelCabin from './Assets/TravelCabin'
import AssetNFT from './Assets/NFT'

const GridWrapper = styled.div<{ columns?: string; mobileColumns?: string }>`
  display: grid;
  grid-template-columns: auto 3fr;
  grid-column-gap: 1rem;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-column-gap: 0.5rem;
  `};
`

export default function Project(): JSX.Element {
  const path = usePathProject()
  const projectInfos = useProjectInfos()
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>()
  const { chainDecimals } = useSubstrate()
  const projectRegistry = getProjectRegistry(path.token)[0]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const TokenImage = require(`assets/tokens/${projectRegistry.icon}`).default
  const { t } = useTranslation()
  // const dexPools = usePoolsWithToken(path.token.toUpperCase())
  const [filteredAsset, setFilteredAsset] = useState<string>(path.asset ? path.asset : 'TravelCabin')

  const stats = useStats(path.token.toUpperCase())

  const noBulletTrain = useMemo(
    () =>
      stats.totalCabinsBought === 0 &&
      stats.totalPassengers === 0 &&
      stats.totalValueLocked.eq(new BN(0)) &&
      stats.totalYieldWithdrawn.eq(new BN(0)),
    [stats.totalCabinsBought, stats.totalPassengers, stats.totalValueLocked, stats.totalYieldWithdrawn]
  )

  useEffect(() => {
    if (!projectInfos) return
    const currentProject = projectInfos.find((project) => project.token.toLowerCase() === path.token)
    setProjectInfo(currentProject)
  }, [projectInfos, path])

  const assetFilter = useMemo(() => {
    const options = ['TravelCabin', 'NFTs (Coming soon)']
    return options.map((label) => ({ label, callback: () => setFilteredAsset(label) }))
  }, [])

  return (
    <>
      <PageWrapper style={{ maxWidth: '680px' }}>
        {path && projectInfo && (
          <>
            <Card borderRadius="0" margin="0 0 1rem 0">
              <GridWrapper columns={'2'} mobileColumns={'2'}>
                <Icon src={TokenImage} size="60px" mobileSize="40px" alt="project logo" />
                {projectInfo && (
                  <ContentWrapper>
                    <SpacedSection>
                      <Header1>{t(projectRegistry.name)}</Header1>
                      <ItalicText>{t(projectRegistry.description)}</ItalicText>
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
            <ContentWrapper>
              <Filter
                options={assetFilter}
                activeOption={filteredAsset}
                modalTitle={t(`Filter Asset`)}
                margin="0 0 1rem 0"
                filterLabel={t('Filter Asset')}
              />
            </ContentWrapper>
            {!noBulletTrain && filteredAsset.toLowerCase() === 'travelcabin' && (
              <AssetTravelCabin projectInfo={projectInfo} />
            )}
            {filteredAsset.toLowerCase() === 'nfts (coming soon)' && <AssetNFT projectInfo={projectInfo} />}

            {/* {projectInfo && <TokenPerformance projectInfo={projectInfo} />} */}
            {/* 
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
            </ContentWrapper> */}
          </>
        )}
      </PageWrapper>
    </>
  )
}
