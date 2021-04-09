import React, { useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Wrapper } from '../../components/Wrapper'
import MainConsole from './MainConsole'

const tabData: Array<TabMetaData> = [
  {
    id: 'swap',
    label: 'Swap',
  },
  {
    id: 'lp-add',
    label: 'Add Liquidity',
  },
  {
    id: 'lp-remove',
    label: 'Remove Liquidity',
  },
]

export default function Dex() {
  const [activeConsole, setActiveConsole] = useState<string>('swap')

  const handleTabSelect = (activeTab: string) => {
    setActiveConsole(activeTab)
  }

  return (
    <PageWrapper>
      <Wrapper
        style={{ width: '100%', maxWidth: '640px', padding: '0.5rem', justifyContent: 'center', alignItems: 'center' }}
      >
        <TabBar
          id={'tabbar-dex'}
          className={'tabbar-container'}
          activeTab={activeConsole}
          tabs={tabData}
          onClick={handleTabSelect}
        />
        <MainConsole activeConsole={activeConsole} />
      </Wrapper>
    </PageWrapper>
  )
}
