import { useLazyQuery } from '@apollo/client'
import Card from 'components/Card'
import CabinBuyerCard from 'components/AssetCards/CabinBuyerCard'
import { DpoProfileCard } from 'components/DpoCard'
import { WarningMsg, Header2, SText, Header3 } from 'components/Text'
import { GridWrapper, IconWrapper, Wrapper } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import { UserPortfolio, UserPortfolioVariables } from 'queries/graphql/types/UserPortfolio'
import userPortfolio from 'queries/graphql/userPortfolio'
import React, { useCallback, useEffect, useContext, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Circle from 'assets/svg/yellow-loader.svg'
import { CustomLightSpinner } from 'theme/components'
import PortfolioSummary from './components/PortfolioSummary'
import ProjectSettings from 'components/ProjectSettings'
import { useProjectState } from 'state/project/hooks'
import { RefreshCw } from 'react-feather'
import { ThemeContext } from 'styled-components'

interface Asset {
  dpoIndexes: string[]
  cabinIndexes: [string, string][]
}

export default function Portfolio(): JSX.Element {
  const wallet = useWallet()
  const { t } = useTranslation()
  const project = useProjectState()
  const theme = useContext(ThemeContext)
  const [loading, setLoading] = useState<boolean>(true)
  const [assets, setAssets] = useState<Asset>({ dpoIndexes: [], cabinIndexes: [] })

  const [loadPortfolio, { error, data }] = useLazyQuery<UserPortfolio, UserPortfolioVariables>(userPortfolio, {
    variables: {
      address: wallet && wallet.address ? wallet.address : '',
    },
  })

  const getPortfolioData = useCallback(() => {
    setLoading(true)
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
    setLoading(false)
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
                      Could not find any Portfolio Items. Check out our <Link to="/bullettrain/dpos">Growth</Link>{' '}
                      section.
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
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <CustomLightSpinner src={Circle} alt="loader" size={'40px'} />
              </div>
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
                {assets.dpoIndexes.length > 0 && (
                  <>
                    <div style={{ display: 'flex', padding: '1rem 0' }}>
                      <Header3>{t(`Your DPOs`)}</Header3>
                    </div>
                    <GridWrapper columns="2">
                      {assets.dpoIndexes.map((dpoIndex, index) => (
                        <DpoProfileCard key={index} dpoIndex={dpoIndex} />
                      ))}
                    </GridWrapper>
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
