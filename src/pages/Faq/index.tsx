import { FlatCard } from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Text, { Heading, SectionTitle } from '../../components/Text'

export default function Faq() {
  const { t } = useTranslation()
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
          <Heading>{t(`Frequently Asked Questions`)}</Heading>
          <SpacedSection>
            <SectionTitle>{t(`How do I login to Spanner's DApp?`)}</SectionTitle>
            <Text>{t(`How do I login to Spanner's DApp? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <SectionTitle>{t(`How do I get tokens on Spanner?`)}</SectionTitle>
            <Text>{t(`How do I get tokens on Spanner? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <SectionTitle>{t(`How do I switch projects?`)}</SectionTitle>
            <Text>{t(`How do I switch projects? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <SectionTitle>{t(`How do I switch chains?`)}</SectionTitle>
            <Text>{t(`How do I switch chains? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <SectionTitle>{t(`Starting a project on Spanner`)}</SectionTitle>
            <Text>{t(`Starting a project on Spanner (answer)`)}</Text>
          </SpacedSection>
        </FlatCard>
      </Wrapper>
    </PageWrapper>
  )
}
