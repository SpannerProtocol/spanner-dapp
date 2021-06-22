import { useQuery } from '@apollo/client'
import LightBanner from 'assets/images/banner-spanner-light.png'
import Card, { BannerCard } from 'components/Card'
import DpoCard from 'components/DpoCard'
import Filter from 'components/Filter'
import { MultiFilter } from 'components/Filter/MultiFilter'
import PillToggleFilter from 'components/Filter/PillToggleFilter'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import SearchBar from 'components/SearchBar'
import { Header1, Header3, Header4, HeavyText, TokenText } from 'components/Text'
import { CenterWrapper, ContentWrapper, PageWrapper, Section, SpacedSection } from 'components/Wrapper'
import Decimal from 'decimal.js'
import { useBlockManager } from 'hooks/useBlocks'
import { useTotalCrowdfundedAmount } from 'hooks/useDpoStats'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useDpoCount, useDpos } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import { UserPortfolio, UserPortfolioVariables } from 'queries/graphql/types/UserPortfolio'
import userPortfolio from 'queries/graphql/userPortfolio'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { useProjectManager } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import { firstBy } from 'thenby'
import { formatToUnit } from 'utils/formatUnit'

function SortDirection({ toggle, isActive }: { toggle: () => void; isActive: boolean }) {
  const theme = useContext(ThemeContext)
  return (
    <PillToggleFilter
      isActive={isActive}
      toggle={toggle}
      margin="0.5rem"
      labelActive="ASC"
      labelInactive="DESC"
      inActiveColor={theme.white}
      inActiveBg={theme.primary1}
    />
  )
}

export function DpoOverviewCard({ token }: { token: string }) {
  const { t } = useTranslation()
  const dpoCount = useDpoCount(token)
  const crowdfundedAmount = useTotalCrowdfundedAmount(token)
  const { chainDecimals } = useSubstrate()
  return (
    <BannerCard url={LightBanner}>
      <ContentWrapper>
        <Header1 colorIsPrimary>{t(`DPOs`)}</Header1>
        <Header3>
          {t(`Organizations crowdfunding for crypto assets. Participate to Earn!`)}{' '}
          <QuestionHelper
            text={t(
              `Earn Yield on Deposits, Management Fee for Creating a DPO, Bonus for Referrals and Milestone Rewards just for participating`
            )}
            size={14}
            backgroundColor={'transparent'}
            padding="0 0.25rem 0 0.25rem"
          />
        </Header3>
        <SpacedSection>
          <RowBetween>
            <Card margin="0 1rem" mobileMargin="0 0.5rem">
              <CenterWrapper display="block">
                <HeavyText colorIsPrimary fontSize="24px" mobileFontSize="18px" width="100%" textAlign="center">
                  {dpoCount}
                </HeavyText>
                <Header4>{t(`Total DPOs`)}</Header4>
              </CenterWrapper>
            </Card>
            <Card margin="0 0.25rem">
              <CenterWrapper display="block">
                <HeavyText colorIsPrimary fontSize="24px" mobileFontSize="18px" width="100%" textAlign="center">
                  {formatToUnit(crowdfundedAmount, chainDecimals)} <TokenText>{token}</TokenText>
                </HeavyText>
                <Header4>{t(`Total Crowdfunded`)}</Header4>
              </CenterWrapper>
            </Card>
          </RowBetween>
        </SpacedSection>
      </ContentWrapper>
    </BannerCard>
  )
}

// SORTING FUNCTIONS

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
  const aName = a.name.toString().toLowerCase()
  const bName = b.name.toString().toLowerCase()
  if (aName < bName) {
    return -1
  }
  if (aName > bName) {
    return 1
  }
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
  const [searchResults, setSearchResults] = useState<DpoInfo[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredState, setFilteredState] = useState<string>('CREATED')
  const [filteredAsset, setFilteredAsset] = useState<string>('ALL')
  const [filteredAffordable, setFilteredAfforable] = useState<boolean>(false)
  const [filteredOwned, setFilteredOwned] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string[]>(['APY'])
  const [sortedOptions, setSortedOptions] = useState<{ [index: string]: boolean }>({})

  const [primaryFilteredDpos, setPrimaryFilteredDpos] = useState<DpoInfo[]>([])
  const [finalDpos, setFinalDpos] = useState<DpoInfo[]>([])
  const { lastBlock, lastBlockReady } = useBlockManager()
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

  const getLastBlock = useCallback(() => lastBlock, [lastBlock])

  // Primary Filters - State and Asset
  // Optimized to only fetch the lastBlock when State or Asset filters rerender
  // Secondary Filters like Balance and UserDpos filter ontop of Primary to avoid too much rerendering
  useEffect(() => {
    if (!lastBlockReady) return
    const currentBlock = getLastBlock()
    if (!currentBlock) return
    const primaryFiltered: DpoInfo[] = []
    unfilteredDpos.forEach((dpo) => {
      if (filteredState !== 'ALL') {
        if (dpo.state.isCreated) {
          // If user filtered EXPIRED which is still CREATED state in DpoInfo
          if (filteredState === 'EXPIRED') {
            if (dpo.expiry_blk.sub(currentBlock).isNeg()) {
              primaryFiltered.push(dpo)
              return
            }
          }
          // Otherwise it is CREATED and we will filter out any expired DPOs
          if (dpo.expiry_blk.sub(currentBlock).isNeg()) return
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

    // disabled because we don't want lastBlock to on triggering a rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unfilteredDpos, unfilteredDpos.length, filteredState, filteredAsset, lastBlockReady])

  // Final after all Filters, Sorts and Searches
  useEffect(() => {
    if (primaryFilteredDpos.length === 0) return
    // Only loop if User filters for affordable or owned
    let filteredDpos: DpoInfo[] = []
    if (filteredAffordable || filteredOwned) {
      primaryFilteredDpos.forEach((dpo) => {
        if (filteredAffordable && filteredOwned) {
          if (dpo.amount_per_seat.lte(balance) && userDpos.includes(dpo.index.toString())) {
            filteredDpos.push(dpo)
          }
        } else {
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
        }
      })
    } else {
      filteredDpos = primaryFilteredDpos
    }
    // Sort the filtered results
    let sortedDpos = filteredDpos
    if (sortBy.length > 0) {
      // Primary sort (first element in Array)
      const firstSortDir = sortedOptions[sortBy[0]] ? 1 : -1
      let sortFn = firstBy(sortMap[sortBy[0]], firstSortDir)
      // Multi sort (remaining sortKeys need to be chained to firstBy method)
      if (sortBy.length > 1) {
        sortBy.forEach((sortKey) => {
          const sortDir = sortedOptions[sortKey] ? 1 : -1
          sortFn = sortFn.thenBy(sortMap[sortKey], sortDir)
        })
      }
      sortedDpos = sortedDpos.sort(sortFn)
    }
    setFinalDpos(sortedDpos)
  }, [
    primaryFilteredDpos,
    primaryFilteredDpos.length,
    balance,
    filteredAffordable,
    filteredOwned,
    userDpos,
    userDpos.length,
    sortBy,
    sortBy.length,
    sortedOptions,
    sortedOptions.length,
  ])

  const sortedOptionsStr = JSON.stringify(sortedOptions)

  // Search after sorted and filtered results
  useEffect(() => {
    const results = finalDpos.filter((dpo) => dpo.name.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }, [finalDpos, finalDpos.length, searchTerm, sortBy.length, sortedOptionsStr])

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
      subElement: (
        <SortDirection
          isActive={sortedOptions[label]}
          toggle={() => setSortedOptions((prev) => ({ ...prev, [label]: !sortedOptions[label] }))}
        />
      ),
      subOnlyActive: true,
    }))
  }, [sortedOptions])

  return (
    <>
      <PageWrapper>
        <DpoOverviewCard token={token} />
        <ContentWrapper>
          <Section style={{ width: '100%' }}>
            {/* filters */}
            <RowFixed>
              <Filter
                options={stateFilterOptions}
                activeOption={filteredState}
                modalTitle={t(`Filter Dpo State`)}
                margin="0.25rem"
                filterLabel={t('State')}
              />
              <Filter
                options={assetFilterOptions}
                activeOption={filteredAsset}
                modalTitle={t(`Filter Targeted Asset`)}
                margin="0.25rem"
                filterLabel={t('Asset')}
              />
              <PillToggleFilter
                isActive={filteredAffordable}
                toggle={() => setFilteredAfforable(!filteredAffordable)}
                margin="0.5rem"
                toggleLabel={t('Enough Balance')}
                labelActive="ON"
                labelInactive="OFF"
              />
              <PillToggleFilter
                isActive={filteredOwned}
                toggle={() => setFilteredOwned(!filteredOwned)}
                margin="0.5rem"
                toggleLabel={t('My DPOs')}
                labelActive="ON"
                labelInactive="OFF"
              />
            </RowFixed>
            <MultiFilter options={sortOptions} activeOptions={sortBy} modalTitle={t(`Sort DPOs by`)} />
            <SearchBar
              inputType="text"
              placeholder={t('Search for Name')}
              keyword={searchTerm}
              setKeyword={setSearchTerm}
              backgroundColor={'#fff'}
            />
          </Section>
          {searchResults.map((dpoInfo, index) => {
            return <DpoCard key={index} dpoInfo={dpoInfo} />
          })}
        </ContentWrapper>
      </PageWrapper>
    </>
  )
}