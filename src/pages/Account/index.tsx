import React, { useEffect, useState } from 'react'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { GridWrapper, PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import Balances from './Balances'
import Portfolio from './Portfolio'
import Bridge from './Bridge'
import Faucet from './Faucet'
import { FlatCardPlate } from 'components/Card'
import { Heading, StandardText } from 'components/Text'
import useWallet from 'hooks/useWallet'
import { RowBetween } from 'components/Row'
import truncateAddress from 'utils/truncateAddress'

const tabData: Array<TabMetaData> = [
  {
    id: 'tab-balances',
    className: 'tab balances-container',
    label: 'Balances',
  },
  {
    id: 'tab-lp-portfolio',
    className: 'tab portfolio-container',
    label: 'Portfolio',
  },
  {
    id: 'tab-lp-bridge',
    className: 'tab bridge-container',
    label: 'Bridge',
  },
  {
    id: 'tab-lp-faucet',
    className: 'tab faucet-container',
    label: 'Faucet',
  },
]

const tabOptions = ['balances', 'portfolio', 'bridge', 'faucet']

export default function Account() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('balances')
  const wallet = useWallet()

  const handleClick = (indexClicked: number) => {
    setActiveTabIndex(indexClicked)
  }

  useEffect(() => {
    const tabName = tabOptions[activeTabIndex]
    setActiveTab(tabName)
  }, [activeTabIndex])

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '960px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlatCardPlate>
          <Section style={{ marginBottom: '1rem' }}>
            <Heading>Account</Heading>
          </Section>
          {wallet && wallet.address && (
            <SpacedSection>
              <GridWrapper columns="2">
                <Section>
                  <RowBetween>
                    <StandardText>Wallet Type:</StandardText>
                    <StandardText>{wallet.type}</StandardText>
                  </RowBetween>
                  {wallet.type === 'custodial' && wallet.ethereumAddress && (
                    <RowBetween>
                      <StandardText>Ethereum Address:</StandardText>
                      <StandardText>{truncateAddress(wallet.ethereumAddress)}</StandardText>
                    </RowBetween>
                  )}
                  <RowBetween>
                    <StandardText>Address:</StandardText>
                    <StandardText>{truncateAddress(wallet.address)}</StandardText>
                  </RowBetween>
                  <Section></Section>
                </Section>
              </GridWrapper>
            </SpacedSection>
          )}
          <TabBar
            id={'tabbar-account'}
            className={'tabbar-container'}
            tabs={tabData}
            onClick={handleClick}
            margin="0"
          />
        </FlatCardPlate>
      </Wrapper>
      <SectionContainer>
        {activeTab === 'balances' && <Balances />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'bridge' && <Bridge />}
        {activeTab === 'faucet' && <Faucet />}
      </SectionContainer>
    </PageWrapper>
  )
}
