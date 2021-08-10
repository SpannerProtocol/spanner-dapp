import { useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, ContentWrapper } from '../../components/Wrapper'
import MainConsole from './MainConsole'
import { SwapBanner } from './SwapConsole'

const tabData: Array<TabMetaData> = [
  {
    id: 'swap',
    label: 'Swap',
  },
  {
    id: 'lp-pool',
    label: 'Pool',
    disabled: true,
    disabledLabel: 'Coming Soon',
  },
]

export default function Dex() {
  const [activeConsole, setActiveConsole] = useState<string>('swap')

  const handleTabSelect = (activeTab: string) => {
    setActiveConsole(activeTab)
  }

  return (
    <PageWrapper>
      {activeConsole === 'swap' && <SwapBanner />}
      <ContentWrapper>
        <TabBar activeTab={activeConsole} tabs={tabData} onClick={handleTabSelect} level={'primary'} />
        <MainConsole activeConsole={activeConsole} />
      </ContentWrapper>
    </PageWrapper>
  )
}
