import { Compact } from '@polkadot/types'
import { BlockNumber } from '@polkadot/types/interfaces'
import BlockBar from 'components/BlockBar'
import GlobalApiSpinner from 'components/GlobalSpinner'
import NetworkSelector from 'components/Network'
import { useConnectionsInit } from 'hooks/useBridge'
import { useCreateTableUser } from 'hooks/useKvStore'
import useStoreAndVerifyReferrer from 'hooks/useStoreReferrer'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { createContext, Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header, { Controls } from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { MEDIA_WIDTHS } from '../theme'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Account from './Account'
import AppBody from './AppBody'
import BulletTrain from './BulletTrain'
import Dex from './Dex'
import Diagnostics from './Diagnostics'
import Faq from './Faq'
import Home from './Home'
import Item from './Item'
import TravelCabinBuyer from './Item/TravelCabin/TravelCabinBuyer'
import Launchpad from './Projects'
import Project from './Projects/Project'

const AppWrapper = styled.div`
  display: grid;
  grid-template-areas:
    'header control'
    'header subcontrol'
    'header content';
  grid-template-rows: minmax(20px, 70px) auto auto;
  grid-template-columns: 280px auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: flex;
  flex-flow: column;
  overflow-x: hidden;
  align-items: flex-start;
`};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  justify-content: space-between;
  `};
`
const SubControl = styled.div`
  grid-area: subcontrol;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex
    width: 100%;
    justify-content: space-between;
    background: linear-gradient(90deg, ${({ theme }) => theme.bg1} -11.67%, ${({ theme }) =>
    theme.bg1} 100%);
  `};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

interface BlockNumbers {
  lastBlock: Compact<BlockNumber> | undefined
}

const INIT_BLOCK_STATE: BlockNumbers = {
  lastBlock: undefined,
}

export const BlockContext = createContext<BlockNumbers>(INIT_BLOCK_STATE)

export default function App() {
  const { width } = useWindowSize()
  const [subNetworkSelector, setSubNetworkSelector] = useState<boolean>(false)

  useStoreAndVerifyReferrer()
  useCreateTableUser()
  useConnectionsInit()

  useEffect(() => {
    if (width && width > MEDIA_WIDTHS.upToMedium) {
      setSubNetworkSelector(false)
    } else {
      setSubNetworkSelector(true)
    }
  }, [width])

  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      <GlobalApiSpinner>
        <AppWrapper>
          <HeaderWrapper>
            <Header width={width} />
          </HeaderWrapper>
          <Controls />
          <SubControl>
            {subNetworkSelector && <NetworkSelector background={'transparent'} />}
            <BlockBar />
          </SubControl>
          <AppBody>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/" component={Home} />
                <Route exact strict path="/dex" component={Dex} />
                <Route exact strict path="/item/:name/:index" component={Item} />
                <Route exact strict path="/item/:name/:index/inventory/:inventoryIndex" component={TravelCabinBuyer} />
                <Route exact strict path="/account" component={Account} />
                <Route exact strict path="/account/:section" component={Account} />
                <Route exact strict path="/bullettrain" component={BulletTrain} />
                <Route exact strict path="/bullettrain/:section" component={BulletTrain} />
                <Route exact strict path="/bullettrain/dpo" component={BulletTrain} />
                <Route exact strict path="/projects" component={Launchpad} />
                <Route exact strict path="/projects/:token" component={Project} />
                <Route exact strict path="/faq" component={Faq} />
                <Route exact strict path="/diagnostics" component={Diagnostics} />
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </AppBody>
        </AppWrapper>
      </GlobalApiSpinner>
    </Suspense>
  )
}
