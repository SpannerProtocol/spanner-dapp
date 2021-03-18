import { StorageKey } from '@polkadot/types'
import DpoCard from 'components/Item/DpoCard'
import SearchBar from 'components/SearchBar'
import { GridWrapper, Section, Wrapper } from 'components/Wrapper'
import { useQueryDposWithKeys } from 'hooks/useQueryDpos'
import { useSubstrate } from 'hooks/useSubstrate'
import { DpoInfo } from 'spanner-interfaces'
import React, { useEffect, useState } from 'react'
import { useItemManager } from 'state/item/hooks'
import { useProjectManager } from 'state/project/hooks'

// A list of DPOs with search functionality
export default function DpoCatalogue() {
  const { projectState } = useProjectManager()
  const dposWithIds = useQueryDposWithKeys(projectState.selectedProject?.token)
  const [searchResults, setSearchResults] = useState<typeof dposWithIds>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { chainDecimals } = useSubstrate()
  const { setItem } = useItemManager()

  useEffect(() => {
    const results = dposWithIds.filter((dposWithId) =>
      dposWithId[1].name.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSearchResults(results)
  }, [dposWithIds, searchTerm])

  const handleClick = (selectedDpo: [StorageKey, DpoInfo]) => {
    setItem({ item: 'dpo', itemKey: selectedDpo[0].args.toString() })
  }

  return (
    <>
      <Wrapper style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Section style={{ width: '100%' }}>
          <SearchBar
            inputType="text"
            placeholder="Search"
            keyword={searchTerm}
            setKeyword={setSearchTerm}
            backgroundColor={'#fff'}
          />
        </Section>
        <GridWrapper columns="3">
          {searchResults.map((entry, index) => {
            const dpoInfo = entry[1]
            const token = dpoInfo.token_id.isToken
              ? dpoInfo.token_id.asToken.toString()
              : dpoInfo.token_id.asDexShare.toString()
            return (
              <DpoCard key={index} item={entry} token={token} chainDecimals={chainDecimals} onClick={handleClick} />
            )
          })}
        </GridWrapper>
      </Wrapper>
    </>
  )
}
