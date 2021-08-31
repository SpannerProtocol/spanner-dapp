import Card from 'components/Card'
import TabBar, { TabMetaData } from 'components/TabBar'
import { SectionContainer } from 'components/Wrapper'
import { useState } from 'react'
import styled from 'styled-components'
import Transactions from './Transactions'
import Transfers from './Transfers'

export const TxRow = styled.div`
  display: grid;
  grid-template-columns: min(240px) auto min(120px);
  grid-column-gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.gray2};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-gap: 5px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: none;
    grid-template-rows: auto auto auto auto;
    grid-row-gap: 0px;
    grid-column-gap: 0px;
    padding: 0.5rem;
`};
`

export const TxCell = styled.div`
  display: block;
  padding: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
`};
`

const tabData: Array<TabMetaData> = [
  {
    id: 'latest-transactions',
    label: 'Transactions',
  },
  {
    id: 'transfers',
    label: 'Transfers',
  },
]

export default function Activity() {
  const [activeTab, setActiveTab] = useState<string>('latest-transactions')

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <>
      <Card>
        <SectionContainer>
          <TabBar
            activeTab={activeTab}
            tabs={tabData}
            onClick={handleTabSelect}
            margin="0"
            fontSize="18px"
            mobileFontSize="14px"
            level={'secondary'}
          />
        </SectionContainer>
        <SectionContainer style={{ marginTop: '0' }}>
          {activeTab === 'latest-transactions' && <Transactions />}
          {activeTab === 'transfers' && <Transfers />}
        </SectionContainer>
      </Card>
    </>
  )
}
