import { useQuery } from '@apollo/client'
import { FlatCard } from 'components/Card'
import CabinBuyerCard from 'components/Item/CabinBuyerCard'
import { DpoProfileCard } from 'components/Item/DpoCard'
import { WarningMsg, SectionHeading, StandardText } from 'components/Text'
import { GridWrapper, Wrapper } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import { UserPortfolio, UserPortfolioVariables } from 'queries/graphql/types/UserPortfolio'
import userPortfolio from 'queries/graphql/userPortfolio'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Circle from 'assets/svg/yellow-loader.svg'
import { CustomLightSpinner } from 'theme/components'

export default function Portfolio(): JSX.Element {
  const wallet = useWallet()
  const { t } = useTranslation()
  const { loading, error, data } = useQuery<UserPortfolio, UserPortfolioVariables>(userPortfolio, {
    variables: {
      address: wallet && wallet.address ? wallet.address : '',
    },
    pollInterval: 5000,
  })

  const userItems = useMemo(() => {
    if (!data || !data.account) return
    let userDpos: string[] = []
    if (data.account.dpos) {
      userDpos = data.account.dpos.split(',')
      userDpos = userDpos.sort((a, b) => parseInt(a) - parseInt(b))
    }
    let userCabins: [string, string][] = []
    if (data.account.travelCabins) {
      const cabinPairs = data.account.travelCabins.split(',')
      userCabins = cabinPairs.map<[string, string]>((indexes) => indexes.split('-') as [string, string])
    }
    return {
      dpoIndexes: userDpos,
      cabinIndexes: userCabins,
    }
  }, [data])

  return (
    <>
      {!(wallet && wallet.address) ? (
        <>
          <FlatCard
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
            <StandardText>{t(`Connect to your wallet to view your Portfolio.`)}</StandardText>
          </FlatCard>
        </>
      ) : (
        <>
          {error && <WarningMsg>{error.message}</WarningMsg>}
          <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {loading && (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <CustomLightSpinner src={Circle} alt="loader" size={'40px'} />
              </div>
            )}
            {userItems && userItems.dpoIndexes.length === 0 && userItems.cabinIndexes.length === 0 && (
              <>
                <FlatCard
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
                  <StandardText>
                    <Trans>
                      Could not find any Portfolio Items. Check out our <Link to="/catalogue">Growth</Link> section.
                    </Trans>
                  </StandardText>
                </FlatCard>
              </>
            )}
            {userItems && userItems.cabinIndexes.length > 0 && (
              <>
                <SectionHeading>{t(`Your TravelCabins`)}</SectionHeading>
                <GridWrapper columns="2">
                  {userItems.cabinIndexes.map((inventory, index) => {
                    return <CabinBuyerCard key={index} cabinIndex={inventory[0]} inventoryIndex={inventory[1]} />
                  })}
                </GridWrapper>
              </>
            )}
            {userItems && userItems.dpoIndexes.length > 0 && (
              <>
                <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
                  <SectionHeading>{t(`Your DPOs`)}</SectionHeading>
                </div>
                <GridWrapper columns="2">
                  {userItems.dpoIndexes.map((dpoIndex, index) => (
                    <DpoProfileCard key={index} dpoIndex={dpoIndex} />
                  ))}
                </GridWrapper>
              </>
            )}
          </Wrapper>
        </>
      )}
    </>
  )
}
