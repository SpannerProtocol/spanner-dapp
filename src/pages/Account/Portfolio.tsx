import { useLazyQuery } from '@apollo/client'
import CabinBuyerCard from 'components/AssetCards/CabinBuyerCard'
import Card from 'components/Card'
import { DpoProfileCard } from 'components/Dpo/DpoCard'
import DpoProfileFilters from 'components/Dpo/DpoProfileFilters'
import ProjectSettings from 'components/ProjectSettings'
import { Header2, Header3, SText, WarningMsg } from 'components/Text'
import { GridWrapper, IconWrapper, Wrapper } from 'components/Wrapper'
import { useDposMulti } from 'hooks/useQueryDpos'
import useWallet from 'hooks/useWallet'
import { UserPortfolio, UserPortfolioVariables } from 'queries/graphql/types/UserPortfolio'
import userPortfolio from 'queries/graphql/userPortfolio'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { Trans, useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-interfaces'
import { useProjectState } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import PortfolioSummary from './PortfolioSummary'

interface Asset {
  dpoIndexes: string[]
  cabinIndexes: [string, string][]
}

export default function Portfolio(): JSX.Element {
  const wallet = useWallet()
  const { t } = useTranslation()
  const project = useProjectState()
  const theme = useContext(ThemeContext)
  const [assets, setAssets] = useState<Asset>({ dpoIndexes: [], cabinIndexes: [] })
  const dpos = useDposMulti(assets.dpoIndexes)
  const [filteredDpos, setFilteredDpos] = useState<DpoInfo[]>([])

  const [loadPortfolio, { loading, error, data }] = useLazyQuery<UserPortfolio, UserPortfolioVariables>(userPortfolio, {
    variables: {
      address: wallet && wallet.address ? wallet.address : '',
    },
    fetchPolicy: 'network-only',
  })

  const getPortfolioData = useCallback(() => {
    loadPortfolio()
  }, [loadPortfolio])

  // on init
  useEffect(() => {
    loadPortfolio()
  }, [loadPortfolio])

  useEffect(() => {
    if (!data || !data.account) return
    let userDpos: string[] = []
    setAssets({
      dpoIndexes: [],
      cabinIndexes: [],
    })
    if (data.account.dpos) {
      userDpos = data.account.dpos.split(',')
      userDpos = userDpos.sort((a, b) => parseInt(a) - parseInt(b))
    }
    let userCabins: [string, string][] = []
    if (data.account.travelCabins) {
      const cabinPairs = data.account.travelCabins.split(',')
      userCabins = cabinPairs.map<[string, string]>((indexes) => indexes.split('-') as [string, string])
    }
    setAssets({
      dpoIndexes: userDpos,
      cabinIndexes: userCabins,
    })
    return () => {
      setAssets({ dpoIndexes: [], cabinIndexes: [] })
    }
  }, [data, loading])

  return (
    <>
      {!(wallet && wallet.address) ? (
        <>
          <Card
            style={{
              width: '100%',
              backgroundColor: '#fff',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: '0.7rem',
              marginBottom: '0.7rem',
              textAlign: 'center',
            }}
          >
            <SText>{t(`Connect to your wallet to view your Portfolio.`)}</SText>
          </Card>
        </>
      ) : (
        <>
          {error && <WarningMsg>{error.message}</WarningMsg>}
          <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {assets.dpoIndexes.length === 0 && assets.cabinIndexes.length === 0 && (
              <>
                <Card
                  style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: '0.7rem',
                    marginBottom: '0.7rem',
                    textAlign: 'center',
                  }}
                >
                  <SText>
                    <Trans>
                      Could not find any Portfolio Items. Check out our <Link to="/bullettrain">Growth</Link> section.
                    </Trans>
                  </SText>
                </Card>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ProjectSettings backgroundColor={'#fff'} />
            </div>
            <PortfolioSummary
              address={wallet.address}
              selectedToken={project.selectedProject ? project.selectedProject.token : 'BOLT'}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Header2 width="fit-content" margin="0">
                {t(`Assets`)}
              </Header2>
              <IconWrapper margin="0 0.5rem" onClick={getPortfolioData}>
                <RefreshCw size={'16px'} color={theme.text3} />
              </IconWrapper>
            </div>
            {loading && (
              <>
                <Skeleton height={10} count={1} style={{ margin: '0.5rem 0' }} />
                <Skeleton height={40} count={1} style={{ margin: '0.5rem 0' }} />
                <Skeleton height={10} count={1} style={{ margin: '0.5rem 0' }} />
                <Skeleton height={40} count={1} style={{ margin: '0.5rem 0' }} />
              </>
            )}
            {!loading && (
              <>
                {assets.cabinIndexes.length > 0 && (
                  <>
                    <div style={{ display: 'flex', padding: '1rem 0' }}>
                      <Header3>{t(`Your TravelCabins`)}</Header3>
                    </div>
                    <GridWrapper columns="2">
                      {assets.cabinIndexes.map((inventory, index) => {
                        return <CabinBuyerCard key={index} cabinIndex={inventory[0]} inventoryIndex={inventory[1]} />
                      })}
                    </GridWrapper>
                  </>
                )}
                {dpos.length > 0 && (
                  <>
                    <div style={{ display: 'flex', padding: '1rem 0 0 0' }}>
                      <Header3>{t(`Your DPOs`)}</Header3>
                    </div>
                    <DpoProfileFilters unfilteredDpos={dpos} setFilteredDpos={setFilteredDpos} />
                    {filteredDpos.map((dpoInfo, index) => (
                      <DpoProfileCard key={index} dpoInfo={dpoInfo} />
                    ))}
                  </>
                )}
              </>
            )}
          </Wrapper>
        </>
      )}
    </>
  )
}
