import { Compact } from '@polkadot/types'
import { BlockNumber } from '@polkadot/types/interfaces'
import { useConnectionsInit } from 'hooks/useBridge'
import { useCreateTableUser } from 'hooks/useKvStore'
import useStoreAndVerifyReferrer from 'hooks/useStoreReferrer'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { createContext } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header, { Controls } from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Account from './Account'
import AppBody from './AppBody'
import Assets from './Assets'
import Bridge from './Bridge'
import BulletTrains from './BulletTrains'
import TravelCabinBuyer from './CabinBuyer'
import Dex from './Dex'
import Diagnostics from './Diagnostics'
import Dpos from './Dpos'
import Dpo from './Dpos/Dpo'
import Faq from './Faq'
import Faucet from './Faucet'
import NewHome from './NewHome'
import Launchpad from './Projects'
import Project from './Projects/Project'
import BulletTrain from './SpannerBulletTrain'

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
    <>
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <HeaderWrapper>
          <Header width={width} />
        </HeaderWrapper>
        <Controls />
        <AppBody>
          <Popups />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/" component={NewHome} />
              <Route exact strict path="/dex" component={Dex} />
              <Route exact strict path="/assets/:name/:index" component={Assets} />
              <Route exact strict path="/assets/:name/:index/:section" component={Assets} />
              <Route exact strict path="/assets/:name/:index/inventory/:inventoryIndex" component={TravelCabinBuyer} />
              <Route exact strict path="/account" component={Account} />
              <Route exact strict path="/account/:section" component={Account} />
              <Route exact strict path="/bridge" component={Bridge} />
              <Route exact strict path="/bullettrain" component={BulletTrains} />
              <Route exact strict path="/bullettrain/:section" component={BulletTrain} />
              <Route exact strict path="/bullettrain/dpo" component={BulletTrain} />
              <Route exact strict path="/bullettrain/dpo/:index" component={BulletTrain} />
              <Route exact strict path="/dpos" component={Dpos} />
              <Route exact strict path="/dpos/dpo/:index/:section" component={Dpo} />
              <Route exact strict path="/faucet" component={Faucet} />
              <Route exact strict path="/projects" component={Launchpad} />
              <Route exact strict path="/projects/:token" component={Project} />
              <Route exact strict path="/faq" component={Faq} />
              <Route exact strict path="/diagnostics" component={Diagnostics} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </AppBody>
      </AppWrapper>
    </>
  )
}
