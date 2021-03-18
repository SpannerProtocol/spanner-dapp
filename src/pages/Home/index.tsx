import { FlatCardPlate } from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import styled from 'styled-components'
import StandardText, { Heading } from '../../components/Text'

const SectionTitle = styled.h3`
  font-weight: 700;
  margin-top: 0.45rem;
  margin-bottom: 0.45rem;
`

const HomePageTitle = styled.h1`
  margin: 0;
  font-size: 40px;
  font-weight: bold;
  color: ${({ theme }) => theme.black};
`

export default function Home() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const { chain, genesis } = useSubstrate()
  return (
    <PageWrapper
      style={{ width: '100%', padding: '0.5rem', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}
    >
      <Wrapper
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SpacedSection style={{ marginBottom: '2rem' }}>
          <HomePageTitle>Spanner</HomePageTitle>
          <Heading>The Blockchain Component Marketplace</Heading>
        </SpacedSection>
        <SpacedSection style={{ marginBottom: '2rem' }}>
          {lastBlock && <Heading>Last Block: #{lastBlock.toString()}</Heading>}
        </SpacedSection>
        <SpacedSection style={{ marginBottom: '2rem' }}>
          <FlatCardPlate style={{ textAlign: 'left' }}>
            <SpacedSection style={{ wordBreak: 'break-word' }}>
              <SectionTitle>Blockchain Info</SectionTitle>
              <StandardText>Connected to: {chain}</StandardText>
              <StandardText>Genesis Hash: {genesis}</StandardText>
              {expectedBlockTime && (
                <StandardText>Estimated Time per Block: {expectedBlockTime.toNumber() / 1000}s</StandardText>
              )}
            </SpacedSection>
          </FlatCardPlate>
        </SpacedSection>
        <SpacedSection style={{ marginBottom: '2rem' }}>
          <FlatCardPlate style={{ textAlign: 'left' }}>
            <SpacedSection>
              <SectionTitle>Get Started</SectionTitle>
              <StandardText>{`1) Connect to a Wallet`}</StandardText>
              <StandardText>{`2) Go to Account > Bridge and transfer tokens over to Spanner`}</StandardText>
              <StandardText>{`3) Go to DEX and swap for BOLT`}</StandardText>
              <StandardText>{`4) Participate in a BulletTrain Campaign`}</StandardText>
            </SpacedSection>
          </FlatCardPlate>
        </SpacedSection>
      </Wrapper>
    </PageWrapper>
  )
}
