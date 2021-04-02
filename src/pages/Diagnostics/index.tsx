import { FlatCard } from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import { useReferrer } from 'hooks/useReferrer'
import React from 'react'
import { useProjectState } from 'state/project/hooks'
import { useReferrerManager } from 'state/referrer/hooks'
import Text, { Heading, SectionTitle } from '../../components/Text'

export default function Diagnostics() {
  const referrer = useReferrer()
  const referrerState = useReferrerManager()
  const projectState = useProjectState()

  const referrerLocal = window.localStorage.getItem('redux_localstorage_simple_referrer')

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
          <Heading>{`Diagnostics`}</Heading>
          {referrer && (
            <SpacedSection>
              <SectionTitle>{`Referral`}</SectionTitle>
              <Text>{referrer}</Text>
            </SpacedSection>
          )}
          {referrerState.referrerState && projectState.selectedProject && referrerState.referrerState.referrer && (
            <SpacedSection>
              <SectionTitle>{`Referrer State (from REDUX)`}</SectionTitle>
              <Text>{referrerState.referrerState.referrer[projectState.selectedProject.token]?.referrer}</Text>
              <Text>{referrerState.referrerState.referrer[projectState.selectedProject.token]?.storedRemotely}</Text>
            </SpacedSection>
          )}
          {referrerLocal && (
            <SpacedSection>
              <SectionTitle>{`Local Storage`}</SectionTitle>
              <Text>{referrerLocal.toString()}</Text>
            </SpacedSection>
          )}
        </FlatCard>
      </Wrapper>
    </PageWrapper>
  )
}
