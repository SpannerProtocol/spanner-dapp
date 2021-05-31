import Card from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Text, { Heading, Header3 } from '../../components/Text'

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
        <Card style={{ textAlign: 'left' }}>
          <Heading>{t(`Frequently Asked Questions`)}</Heading>
          <SpacedSection>
            <Header3>{t(`How do I login to Spanner's DApp?`)}</Header3>
            <Text>{t(`How do I login to Spanner's DApp? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I get tokens on Spanner?`)}</Header3>
            <Text>{t(`How do I get tokens on Spanner? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I switch projects?`)}</Header3>
            <Text>{t(`How do I switch projects? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I switch chains?`)}</Header3>
            <Text>{t(`How do I switch chains? (answer)`)}</Text>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`Starting a project on Spanner`)}</Header3>
            <Text>{t(`Starting a project on Spanner (answer)`)}</Text>
          </SpacedSection>
        </Card>
      </Wrapper>
    </PageWrapper>
  )
}
