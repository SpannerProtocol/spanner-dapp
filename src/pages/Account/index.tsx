import Activity from 'components/Activity'
import { ButtonSecondary, FakeButton } from 'components/Button'
import { FlatCard } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { RowBetween } from 'components/Row'
import { Heading, HeavyText, StandardText } from 'components/Text'
import { useSelectedProject } from 'hooks/useProject'
import { useReferrer } from 'hooks/useReferrer'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnectionsState } from 'state/connections/hooks'
import styled from 'styled-components'
import { useAccount } from 'utils/usePath'
import { RouteTabBar, RouteTabMetaData } from '../../components/TabBar'
import {
  BorderedWrapper,
  ButtonWrapper,
  PageWrapper,
  Section,
  SectionContainer,
  Wrapper,
} from '../../components/Wrapper'
import { DAPP_HOST } from '../../constants'
import { shortenAddr } from '../../utils/truncateString'
import Balances from './Balances'
import Bridge from './Bridge'
import Faucet from './Faucet'
import Portfolio from './Portfolio'

const CopyWrapper = styled.div`
  cursor: pointer;
`

export default function Account() {
  const [activeTab, setActiveTab] = useState<string>('balances')
  const currentPath = useAccount()
  const wallet = useWallet()
  const { t } = useTranslation()
  const referrer = useReferrer()
  const connectionState = useConnectionsState()
  const project = useSelectedProject()
  const [revealReferrer, setRevealReferrer] = useState<boolean>(false)

  const currentChain = connectionState && connectionState.chain

  const tabData = useMemo(() => {
    const tabs: Array<RouteTabMetaData> = []
    const allChains = [
      {
        id: 'balances',
        label: 'Balances',
        path: '/account/balances',
      },
      {
        id: 'portfolio',
        label: 'Portfolio',
        path: '/account/portfolio',
      },
      {
        id: 'activity',
        label: 'Activity',
        path: '/account/activity',
      },
    ]
    const hammerOnly = [
      {
        id: 'faucet',
        label: 'Faucet',
        path: '/account/faucet',
      },
    ]
    const spannerOnly = [
      {
        id: 'bridge',
        label: 'Bridge',
        path: '/account/bridge',
      },
    ]
    tabs.push(...allChains)
    if (currentChain) {
      if (currentChain === 'Spanner') {
        tabs.push(...spannerOnly)
      } else if (currentChain === 'Hammer') {
        tabs.push(...hammerOnly)
      }
    }
    return tabs
  }, [currentChain])

  useEffect(() => {
    if (!currentPath.item) return
    setActiveTab(currentPath.item)
  }, [currentPath.item])

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '700px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlatCard>
          <Section style={{ marginBottom: '1rem' }}>
            <RowBetween>
              <Heading>{t(`Account`)}</Heading>
              <div style={{ display: 'flex' }}>
                {wallet && wallet.address && project && (
                  <div style={{ padding: '0.25rem' }}>
                    <CopyHelper
                      toCopy={`${DAPP_HOST}/#/?ref=${wallet.address}&project=${project.token}`}
                      childrenIsIcon={true}
                    >
                      <ButtonWrapper style={{ width: '120px' }}>
                        <FakeButton padding="0.5rem" fontSize="10px">
                          {t(`Get Referral Link`)}
                        </FakeButton>
                      </ButtonWrapper>
                    </CopyHelper>
                  </div>
                )}
                {referrer && (
                  <div style={{ padding: '0.25rem' }}>
                    <ButtonSecondary
                      padding="0.5rem"
                      fontSize={'10px'}
                      mobileFontSize={'10px'}
                      width={'120px'}
                      onClick={() => setRevealReferrer(!revealReferrer)}
                    >
                      {t(`Check your Referrer`)}
                    </ButtonSecondary>
                  </div>
                )}
              </div>
            </RowBetween>
          </Section>
          {referrer && revealReferrer && (
            <BorderedWrapper>
              <Section>
                <RowBetween>
                  <HeavyText fontSize="14px">{t(`Referrer`)}</HeavyText>
                  <CopyWrapper style={{ display: 'flex' }}>
                    <CopyHelper toCopy={`${referrer}`} childrenIsIcon={true}>
                      <StandardText fontSize="14px">{shortenAddr(referrer, 8)}</StandardText>
                    </CopyHelper>
                  </CopyWrapper>
                </RowBetween>
              </Section>
            </BorderedWrapper>
          )}
          <RouteTabBar activeTab={activeTab} tabs={tabData} margin="0" />
        </FlatCard>
      </Wrapper>
      <SectionContainer style={{ minHeight: '700px', marginTop: '0' }}>
        {activeTab === 'balances' && <Balances />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'bridge' && <Bridge />}
        {currentChain === 'Hammer' && activeTab === 'faucet' && <Faucet />}
        {activeTab === 'activity' && <Activity />}
      </SectionContainer>
    </PageWrapper>
  )
}
