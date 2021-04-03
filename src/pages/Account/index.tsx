import { FlatCard } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { RowBetween } from 'components/Row'
import { Heading, StandardText } from 'components/Text'
import { useReferrer } from 'hooks/useReferrer'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { shortenAddress } from 'utils'
import TabBar, { TabMetaData } from '../../components/TabBar'
import { PageWrapper, Section, SectionContainer, SpacedSection, Wrapper } from '../../components/Wrapper'
import { shortenAddr } from '../../utils/truncateString'
import Balances from './Balances'
import Bridge from './Bridge'
import Faucet from './Faucet'
import Portfolio from './Portfolio'

const CopyWrapper = styled.div`
  cursor: pointer;
`

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
  const referrer = useReferrer()

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
        <FlatCard>
          <Section style={{ marginBottom: '1rem' }}>
            <Heading>{t(`Account`)}</Heading>
          </Section>
          {wallet && wallet.address && (
            <SpacedSection>
              <Section>
                <RowBetween>
                  <StandardText>{t(`Wallet Type`)}:</StandardText>
                  <StandardText>{wallet.type}</StandardText>
                </RowBetween>
                {wallet.type === 'custodial' && wallet.ethereumAddress && (
                  <RowBetween>
                    <StandardText>{t(`Ethereum Address`)}:</StandardText>
                    <CopyWrapper style={{ display: 'flex' }}>
                      <CopyHelper toCopy={`${wallet.ethereumAddress}`} childrenIsIcon={true}>
                        <StandardText>{shortenAddress(wallet.ethereumAddress)}</StandardText>
                      </CopyHelper>
                    </CopyWrapper>
                  </RowBetween>
                )}
                <RowBetween>
                  <StandardText>{t(`Address`)}:</StandardText>
                  <CopyWrapper style={{ display: 'flex' }}>
                    <CopyHelper toCopy={`${wallet.address}`} childrenIsIcon={true}>
                      <StandardText>{shortenAddr(wallet.address)}</StandardText>
                    </CopyHelper>
                  </CopyWrapper>
                </RowBetween>
                {referrer && (
                  <RowBetween>
                    <StandardText>{t(`Referrer`)}</StandardText>
                    <CopyWrapper style={{ display: 'flex' }}>
                      <CopyHelper toCopy={`${referrer}`} childrenIsIcon={true}>
                        <StandardText>{shortenAddr(referrer)}</StandardText>
                      </CopyHelper>
                    </CopyWrapper>
                  </RowBetween>
                )}
              </Section>
            </SpacedSection>
          )}
          <TabBar
            id={'tabbar-account'}
            className={'tabbar-container'}
            tabs={tabData}
            onClick={handleClick}
            margin="0"
          />
        </FlatCard>
      </Wrapper>
      <SectionContainer style={{ minHeight: '700px', marginTop: '0' }}>
        {activeTab === 'balances' && <Balances />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'bridge' && <Bridge />}
        {activeTab === 'faucet' && <Faucet />}
      </SectionContainer>
    </PageWrapper>
  )
}
