import { RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const TabBarWrapper = styled.div<{ margin?: string; level?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  background: ${({ level, theme }) => (level === 'primary' ? theme.bg3 : theme.bg4)};
  border: 2px solid transparent;
  border-radius: 10px;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  margin: ${({ margin }) => (margin ? margin : '0 0rem 1rem 0')};
`

const TabWrapper = styled.div<{ active?: boolean; level?: string }>`
  background: ${({ active, level, theme }) => (active ? theme.primary1 : level === 'primary' ? theme.bg3 : theme.bg4)};
  padding: 0.5rem;
  border: 3px solid ${({ active }) => (active ? 'transparent' : 'transparent')};
  border-radius: 10px;
  cursor: pointer;
`

const Tab = styled.div`
  width: 100%;
`

const TabText = styled.p<{
  fontSize?: string
  mobileFontSize?: string
  active?: boolean
  level?: string
  margin?: string
}>`
  width: fit-content;
  color: ${({ active, level, theme }) => (active ? theme.white : level === 'primary' ? theme.text1 : theme.text1)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')}
  font-weight: ${(active) => (active ? 900 : 300)};
  text-align: center;
  margin: ${({ margin }) => (margin ? margin : 'auto')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? `${mobileFontSize}` : '12px'};
  `}
`

interface TabBarCoreProps {
  activeTab: string
  activeColor?: string
  fontSize?: string
  mobileFontSize?: string
  margin?: string
  level?: 'primary' | 'secondary'
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
  disabled?: boolean
  disabledLabel?: string
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
  level,
}: TabBarProps): JSX.Element {
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
    <TabBarWrapper margin={margin} level={level}>
      {tabs &&
        tabs.map((tab, index) => {
          const active = tabs.findIndex((tab) => tab.id === activeTab) === index
          return (
            <TabWrapper key={index} active={active} level={level}>
              {tab.disabled ? (
                <Tab key={index}>
                  <RowFixed justifyContent="center">
                    <TabText
                      margin="0"
                      fontSize={fontSize}
                      mobileFontSize={mobileFontSize}
                      active={active}
                      level={level}
                    >
                      {t(tab.label)}
                    </TabText>
                    <SText padding="0 0.25rem" fontSize="12px" mobileFontSize="10px">
                      {`(${t(tab.disabledLabel)})`}
                    </SText>
                  </RowFixed>
                </Tab>
              ) : (
                <Tab key={index} onClick={() => handleClick(index)}>
                  <TabText fontSize={fontSize} mobileFontSize={mobileFontSize} active={active} level={level}>
                    {t(tab.label)}
                  </TabText>
                </Tab>
              )}
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
export function RouteTabBar({
  tabs,
  activeTab,
  margin,
  fontSize,
  mobileFontSize,
  level,
}: RouteTabBarProps): JSX.Element {
  const { t } = useTranslation()

  // Parent check path
  // Path updates activeTab
  // ActiveTab gets updated in this component
  // If new tab gets clicked, changes path

  return (
    <TabBarWrapper margin={margin} level={level}>
      {tabs &&
        tabs.map((tab, index) => {
          const active = tabs.findIndex((tab) => tab.id === activeTab) === index
          return (
            <TabWrapper key={index} active={active} level={level}>
              <Link to={{ pathname: tab.path }} style={{ textDecoration: 'none' }}>
                <Tab>
                  <TabText fontSize={fontSize} mobileFontSize={mobileFontSize} active={active} level={level}>
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
