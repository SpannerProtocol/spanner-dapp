import { FlatCard } from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import useWallet from 'hooks/useWallet'
import React from 'react'
import Text, { Heading, SectionTitle } from '../../components/Text'

/**
 * Just a debugging page.
 */
export default function Diagnostic() {
  const wallet = useWallet()
  return (
    <PageWrapper style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlatCard style={{ textAlign: 'left' }}>
          <Heading>Diagnsotics</Heading>
          {wallet && wallet.address && (
            <SpacedSection>
              <SectionTitle>Account</SectionTitle>
              <Text>{wallet.address}</Text>
            </SpacedSection>
          )}
        </FlatCard>
      </Wrapper>
    </PageWrapper>
  )
}
