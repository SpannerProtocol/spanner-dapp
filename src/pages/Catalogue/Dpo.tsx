import DpoCard from 'components/Item/DpoCard'
import SearchBar from 'components/SearchBar'
import { GridWrapper, Section, Wrapper } from 'components/Wrapper'
import { useDposWithKeys } from 'hooks/useQueryDpos'
import React, { useEffect, useState } from 'react'
import { useProjectManager } from 'state/project/hooks'

// A list of DPOs with search functionality
export default function DpoCatalogue() {
  const { projectState } = useProjectManager()
  const dposWithIds = useDposWithKeys(projectState.selectedProject?.token)
  const [searchResults, setSearchResults] = useState<typeof dposWithIds>([])
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    const results = dposWithIds.filter((dposWithId) =>
      dposWithId[1].name.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSearchResults(results)
  }, [dposWithIds, searchTerm])

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
        <GridWrapper columns="2">
          {searchResults.map((entry, index) => {
            return <DpoCard key={index} dpoIndex={entry[0]} />
          })}
        </GridWrapper>
      </Wrapper>
    </>
  )
}
