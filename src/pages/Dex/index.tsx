import React, { useEffect, useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Wrapper } from '../../components/Wrapper'
import MainConsole from './MainConsole'

const consoleOptions = ['swap', 'lp-add', 'lp-remove']

const tabData: Array<TabMetaData> = [
  {
    id: 'tab-swap',
    className: 'tab swap-container',
    label: 'Swap',
  },
  {
    id: 'tab-lp-add',
    className: 'tab lp-add-container',
    label: 'Add Liquidity',
  },
  {
    id: 'tab-lp-remove',
    className: 'tab lp-remove-container',
    label: 'Remove Liquidity',
  },
]

export default function Dex() {
  const [activeConsoleIndex, setActiveConsoleIndex] = useState<number>(0)
  const [activeConsole, setActiveConsole] = useState<string>('swap')

  const handleClick = (indexClicked: number) => {
    setActiveConsoleIndex(indexClicked)
  }

  // Side effects of choosing the active console from tabs
  useEffect(() => {
    const consoleName = consoleOptions[activeConsoleIndex]
    setActiveConsole(consoleName)
  }, [activeConsoleIndex])

  return (
    <PageWrapper>
      <Wrapper
        style={{ width: '100%', maxWidth: '640px', padding: '0.5rem', justifyContent: 'center', alignItems: 'center' }}
      >
        <TabBar id={'tabbar-dex'} className={'tabbar-container'} tabs={tabData} onClick={handleClick} />
        <MainConsole activeConsole={activeConsole} />
      </Wrapper>
    </PageWrapper>
  )
}
