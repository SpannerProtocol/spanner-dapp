import { FlatCardPlate } from 'components/Card'
import { RowBetween } from 'components/Row'
import { Heading, StandardText } from 'components/Text'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { GridWrapper, PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import truncateString from '../../utils/truncateString'
import Balances from './Balances'
import Bridge from './Bridge'
import Faucet from './Faucet'
import Portfolio from './Portfolio'

const tabData: Array<TabMetaData> = [
  {
    id: 'tab-balances',
    className: 'tab balances-container',
    label: 'Balances',
  },
  {
    id: 'tab-portfolio',
    className: 'tab portfolio-container',
    label: 'Portfolio',
  },
  {
    id: 'tab-bridge',
    className: 'tab bridge-container',
    label: 'Bridge',
  },
  {
    id: 'tab-faucet',
    className: 'tab faucet-container',
    label: 'Faucet',
  },
]

const tabOptions = ['balances', 'portfolio', 'bridge', 'faucet']

export default function Account() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('balances')
  const wallet = useWallet()
  const { t } = useTranslation()

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
            <Heading>{t(`Account`)}</Heading>
          </Section>
          {wallet && wallet.address && (
            <SpacedSection>
              <GridWrapper columns="2">
                <Section>
                  <RowBetween>
                    <StandardText>{t(`Wallet Type`)}:</StandardText>
                    <StandardText>{wallet.type}</StandardText>
                  </RowBetween>
                  {wallet.type === 'custodial' && wallet.ethereumAddress && (
                    <RowBetween>
                      <StandardText>{t(`Ethereum Address`)}:</StandardText>
                      <StandardText>{truncateString(wallet.ethereumAddress)}</StandardText>
                    </RowBetween>
                  )}
                  <RowBetween>
                    <StandardText>{t(`Address`)}:</StandardText>
                    <StandardText>{truncateString(wallet.address)}</StandardText>
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
      <SectionContainer style={{ marginTop: '0' }}>
        {activeTab === 'balances' && <Balances />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'bridge' && <Bridge />}
        {activeTab === 'faucet' && <Faucet />}
      </SectionContainer>
    </PageWrapper>
  )
}
