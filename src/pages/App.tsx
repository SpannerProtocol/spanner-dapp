import { Compact } from '@polkadot/types'
import { BlockNumber } from '@polkadot/types/interfaces'
import GlobalApiSpinner from 'components/GlobalSpinner'
import { useConnectionsInit } from 'hooks/useBridge'
import { useCreateTableUser } from 'hooks/useKvStore'
import useStoreAndVerifyReferrer from 'hooks/useStoreReferrer'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { createContext, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Account from './Account'
import AppBody from './AppBody'
import BulletTrain from './SpannerBulletTrain'
import Dex from './Dex'
import Diagnostics from './Diagnostics'
import Faq from './Faq'
import Home from './Home'
import Item from './Item'
import TravelCabinBuyer from './CabinBuyer'
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

  useStoreAndVerifyReferrer()
  useCreateTableUser()
  useConnectionsInit()
  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      <GlobalApiSpinner>
        <AppWrapper>
          <HeaderWrapper>
            <Header width={width} />
          </HeaderWrapper>
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
