import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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

const TabText = styled.div<{ fontSize?: string; mobileFontSize?: string }>`
  width: 100%;
  color: ${({ theme }) => theme.text1};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '18px')}
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? `${mobileFontSize}` : '16px'};
  `}
`

interface TabBarCoreProps {
  activeTab: string
  activeColor?: string
  fontSize?: string
  mobileFontSize?: string
  margin?: string
}

interface TabBarProps extends TabBarCoreProps {
  tabs: Array<TabMetaData>
  onClick: (tabId: string) => void
}

interface RouteTabBarProps extends TabBarCoreProps {
  tabs: RouteTabMetaData[]
}
export interface TabMetaData {
  id: string
  label: string
  onClick?: (e: React.MouseEvent) => any
}

export interface RouteTabMetaData extends TabMetaData {
  path: string
}

export default function TabBar({
  activeTab,
  tabs,
  onClick,
  margin,
  fontSize,
  mobileFontSize,
}: TabBarProps): JSX.Element {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()

  const handleClick = (indexClicked: number) => {
    const selectedTab = tabs[indexClicked]
    onClick(selectedTab.id)
  }

  useEffect(() => {
    if (!onClick || !activeTab) return
    return onClick(activeTab)
  }, [activeTab, onClick])

  return (
    <TabBarWrapper margin={margin}>
      {tabs &&
        tabs.map((tab, index) => {
          const active = tabs.findIndex((tab) => tab.id === activeTab) === index
          return (
            <TabWrapper key={index}>
              <Tab key={index} onClick={() => handleClick(index)}>
                <TabText
                  fontSize={fontSize}
                  mobileFontSize={mobileFontSize}
                  style={{
                    color: active ? `${theme.black}` : `${theme.text3}`,
                    borderBottom: active ? `3px solid ${theme.primary1}` : `none`,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {t(tab.label)}
                </TabText>
              </Tab>
            </TabWrapper>
          )
        })}
    </TabBarWrapper>
  )
}

/**
 * RouteTabBars are meant to use paths passed to react-router-dom's Link component
 * to change the pathname. The parent component should detect changes to path to
 * decide the activeTab. Pass the activeTab to RouteTabBar to change the activeTab visually.
 */
export function RouteTabBar({ tabs, activeTab, margin, fontSize, mobileFontSize }: RouteTabBarProps): JSX.Element {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()

  // Parent check path
  // Path updates activeTab
  // ActiveTab gets updated in this component
  // If new tab gets clicked, changes path

  return (
    <TabBarWrapper margin={margin}>
      {tabs &&
        tabs.map((tab, index) => {
          const active = tabs.findIndex((tab) => tab.id === activeTab) === index
          return (
            <TabWrapper key={index}>
              <Link to={{ pathname: tab.path }} style={{ textDecoration: 'none' }}>
                <Tab>
                  <TabText
                    fontSize={fontSize}
                    mobileFontSize={mobileFontSize}
                    style={{
                      color: active ? `${theme.black}` : `${theme.text3}`,
                      borderBottom: active ? `3px solid ${theme.primary1}` : `none`,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {t(tab.label)}
                  </TabText>
                </Tab>
              </Link>
            </TabWrapper>
          )
        })}
    </TabBarWrapper>
  )
}
