import DpoCard from 'components/DpoCard'
import SearchBar from 'components/SearchBar'
import Filter from 'components/Filter'
import { GridWrapper, Section, Wrapper } from 'components/Wrapper'
import { useDpos } from 'hooks/useQueryDpos'
import React, { useEffect, useMemo, useState } from 'react'
import { useProjectManager } from 'state/project/hooks'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { SText } from 'components/Text'
// import { useBlockManager } from 'hooks/useBlocks'
import { RowFixed } from 'components/Row'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useQuery } from '@apollo/client'
import { UserPortfolio, UserPortfolioVariables } from 'queries/graphql/types/UserPortfolio'
import userPortfolio from 'queries/graphql/userPortfolio'
import useWallet from 'hooks/useWallet'
import { MultiFilter } from 'components/Filter/MultiFilter'
import PillToggleFilter from 'components/Filter/PillToggleFilter'
import { firstBy } from 'thenby'
import Decimal from 'decimal.js'

/**
 * Doesn't actually sort by APY but sorts by yield / deposit to keep it lightweight
 * @param a
 * @param b
 */
export function sortByApy(a: DpoInfo, b: DpoInfo) {
  const aYield = new Decimal(a.target_yield_estimate.toString())
  const aDeposit = new Decimal(a.target_amount.toString())
  const bYield = new Decimal(b.target_yield_estimate.toString())
  const bDeposit = new Decimal(b.target_amount.toString())
  const aPercYield = aYield.div(aDeposit)
  const bPercYield = bYield.div(bDeposit)
  return aPercYield.sub(bPercYield).toNumber()
}

/**
 * Sort by Bonus Rate
 * @param a
 * @param b
 * @returns
 */
export function sortByBonus(a: DpoInfo, b: DpoInfo) {
  const aBonus = new Decimal(a.target_bonus_estimate.toString())
  const aDeposit = new Decimal(a.target_amount.toString())
  const bBonus = new Decimal(b.target_bonus_estimate.toString())
  const bDeposit = new Decimal(b.target_amount.toString())
  const aBonusRate = aBonus.div(aDeposit)
  const bBonusRate = bBonus.div(bDeposit)
  return aBonusRate.sub(bBonusRate).toNumber()
}

export function sortById(a: DpoInfo, b: DpoInfo) {
  return a.index.toNumber() - b.index.toNumber()
}

export function sortByName(a: DpoInfo, b: DpoInfo) {
  const aName = a.name.toString()
  const bName = b.name.toString()
  if (aName < bName) return -1
  if (aName > bName) return 1
  return 0
}

const sortMap: { [key: string]: (a: DpoInfo, b: DpoInfo) => number } = {
  APY: sortByApy,
  Bonus: sortByBonus,
  ID: sortById,
  Name: sortByName,
}

// A list of DPOs with search functionality
export default function Dpos() {
  const { projectState: project } = useProjectManager()
  const token = useMemo(() => (project.selectedProject ? project.selectedProject.token : 'BOLT'), [project])
  const unfilteredDpos = useDpos(token)
  const [searchResults, setSearchResults] = useState<typeof unfilteredDpos>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredState, setFilteredState] = useState<string>('CREATED')
  const [filteredAsset, setFilteredAsset] = useState<string>('ALL')
  const [filteredAffordable, setFilteredAfforable] = useState<boolean>(false)
  const [filteredOwned, setFilteredOwned] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string[]>(['APY'])

  const [primaryFilteredDpos, setPrimaryFilteredDpos] = useState<DpoInfo[]>([])
  const [finalDpos, setFinalDpos] = useState<DpoInfo[]>([])
  // const { lastBlock } = useBlockManager()
  const { t } = useTranslation()
  const balance = useSubscribeBalance(token)
  const wallet = useWallet()
  const { data: userAssetData } = useQuery<UserPortfolio, UserPortfolioVariables>(userPortfolio, {
    variables: {
      address: wallet && wallet.address ? wallet.address : '',
    },
  })

  const userDpos = useMemo(() => {
    if (userAssetData && userAssetData.account && userAssetData.account.dpos) {
      return userAssetData.account.dpos.split(',')
    }
    return []
  }, [userAssetData])

  // Search all
  useEffect(() => {
    const results = unfilteredDpos.filter((dpo) => dpo.name.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }, [unfilteredDpos, searchTerm])

  // Primary Filters
  // Renders often because of lastBlock. Could be an area for optimization.
  useEffect(() => {
    // if (!lastBlock) return
    const primaryFiltered: DpoInfo[] = []
    unfilteredDpos.forEach((dpo) => {
      if (filteredState !== 'ALL') {
        if (dpo.state.isCreated) {
          // If user filtered EXPIRED which is still CREATED state in DpoInfo
          // if (filteredState === 'EXPIRED') {
          //   if (dpo.expiry_blk.sub(lastBlock).isNeg()) {
          //     primaryFiltered.push(dpo)
          //     return
          //   }
          // }
          // Otherwise it is CREATED and we will filter out any expired DPOs
          // if (dpo.expiry_blk.sub(lastBlock).isNeg()) return
        }
        if (!dpo.state.eq(filteredState)) return
      }
      if (filteredAsset !== 'ALL') {
        if (filteredAsset === 'TravelCabin') {
          if (!dpo.target.isTravelCabin) return
        }
        if (filteredAsset === 'DPO Seats') {
          if (!dpo.target.isDpo) return
        }
      }
      primaryFiltered.push(dpo)
    })
    setPrimaryFilteredDpos(primaryFiltered)
  }, [unfilteredDpos, unfilteredDpos.length, filteredState, filteredAsset])

  // Final after all Filters, Sorts and Searches
  useEffect(() => {
    if (primaryFilteredDpos.length === 0) return
    // Only loop if User filters for affordable or owned
    let filteredDpos: DpoInfo[] = []
    if (filteredAffordable || filteredOwned) {
      primaryFilteredDpos.forEach((dpo) => {
        if (filteredAffordable) {
          if (dpo.amount_per_seat.lte(balance)) {
            filteredDpos.push(dpo)
          }
        }
        if (filteredOwned) {
          if (userDpos.includes(dpo.index.toString())) {
            filteredDpos.push(dpo)
          }
        }
      })
    } else {
      filteredDpos = primaryFilteredDpos
    }
    // Sort the filtered results
    let sortedDpos = filteredDpos
    if (sortBy.length > 0) {
      // Primary sort (first element in Array)
      let sortFn = firstBy(sortMap[sortBy[0]], -1)
      // Multi sort (remaining sortKeys need to be chained to firstBy method)
      if (sortBy.length > 1) {
        sortBy.forEach((sortKey) => {
          sortFn = sortFn.thenBy(sortMap[sortKey], -1)
        })
      }
      sortedDpos = sortedDpos.sort(sortFn)
    }
    setFinalDpos(sortedDpos)
  }, [primaryFilteredDpos, balance, filteredAffordable, filteredOwned, userDpos, sortBy, sortBy.length])

  const stateFilterOptions = useMemo(() => {
    const options = ['ALL', 'CREATED', 'ACTIVE', 'RUNNING', 'COMPLETED', 'EXPIRED', 'FAILED']
    return options.map((label) => ({ label, callback: () => setFilteredState(label) }))
  }, [])

  const assetFilterOptions = useMemo(() => {
    const options = ['ALL', 'TravelCabin', 'DPO Seats']
    return options.map((label) => ({ label, callback: () => setFilteredAsset(label) }))
  }, [])

  const sortOptions = useMemo(() => {
    const options = ['APY', 'Bonus', 'ID', 'Name']
    return options.map((label) => ({
      label,
      callback: () => {
        setSortBy((prev) => {
          if (prev.includes(label)) {
            return prev.filter((key) => key !== label)
          }
          return [...prev, label]
        })
      },
    }))
  }, [])

  return (
    <>
      <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Section style={{ width: '100%' }}>
          {/* filters */}
          <RowFixed>
            <Filter
              options={stateFilterOptions}
              activeOption={filteredState}
              modalTitle={t(`Filter Dpo State`)}
              margin="0.5rem"
            />
            <Filter
              options={assetFilterOptions}
              activeOption={filteredAsset}
              modalTitle={t(`Filter Targeted Asset`)}
              margin="0.5rem"
            />
            <PillToggleFilter
              isActive={filteredAffordable}
              toggle={() => setFilteredAfforable(!filteredAffordable)}
              margin="0.5rem"
              toggleLabel="Enough Balance"
            />
            <PillToggleFilter
              isActive={filteredOwned}
              toggle={() => setFilteredOwned(!filteredOwned)}
              margin="0.5rem"
              toggleLabel="My DPOs"
            />
          </RowFixed>
          <MultiFilter options={sortOptions} activeOptions={sortBy} modalTitle={t(`Sort DPOs by`)} />
          <SearchBar
            inputType="text"
            placeholder="Search"
            keyword={searchTerm}
            setKeyword={setSearchTerm}
            backgroundColor={'#fff'}
          />
        </Section>
        <SText>{searchResults.length}</SText>
        <GridWrapper columns="2">
          {finalDpos.map((dpoInfo, index) => {
            return <DpoCard key={index} dpoInfo={dpoInfo} />
          })}
        </GridWrapper>
      </Wrapper>
    </>
  )
}
