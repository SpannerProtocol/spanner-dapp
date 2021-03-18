import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'

const TabBarWrapper = styled.div<{ margin?: string }>`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  margin: ${({ margin }) => (margin ? margin : '0 0rem 2rem 0')};
`

const TabWrapper = styled.div`
  display: flex;
  margin-right: 0.8rem;
`

const Tab = styled.div`
  width: 100%;
`

const TabText = styled.div`
  width: 100%;
  font-size: 18px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
`

interface TabBarProps {
  id?: string
  className?: string
  tabs: Array<TabMetaData>
  activeColor?: string
  onClick?: (index: number) => void
  margin?: string
}

export interface TabMetaData {
  id?: string
  className?: string
  label: string
  callback?: () => any
  onClick?: (e: React.MouseEvent) => any
}

// TabBar component takes an array of TabMetaData. If passed a click handler as a callback,
// it will return the index of the tab clicked.
export default function TabBar(props: TabBarProps): JSX.Element {
  const { id, className, tabs, onClick, margin } = props
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const theme = useContext(ThemeContext)

  const handleClick = (event: React.MouseEvent, indexClicked: number) => {
    setActiveIndex(indexClicked)
    const activeTab = tabs[indexClicked]
    if (!activeTab.callback) return
    activeTab.callback()
  }

  useEffect(() => {
    if (!onClick) return
    return onClick(activeIndex)
  }, [activeIndex, onClick])

  return (
    <TabBarWrapper id={id} className={className} margin={margin}>
      {tabs &&
        tabs.map((tab, index) => {
          const active = activeIndex === index
          return (
            <TabWrapper key={index}>
              <Tab key={index} id={tab.id} className={tab.className} onClick={(event) => handleClick(event, index)}>
                <TabText
                  style={{
                    color: active ? `${theme.black}` : `${theme.text3}`,
                    borderBottom: active ? `3px solid ${theme.primary1}` : `none`,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {tab.label}
                </TabText>
              </Tab>
            </TabWrapper>
          )
        })}
    </TabBarWrapper>
  )
}
