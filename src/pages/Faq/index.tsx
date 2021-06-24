import Card from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Heading, Header3, SText } from '../../components/Text'

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
            <SText>{t(`How do I login to Spanner's DApp? (answer)`)}</SText>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I get tokens on Spanner?`)}</Header3>
            <SText>{t(`How do I get tokens on Spanner? (answer)`)}</SText>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I switch projects?`)}</Header3>
            <SText>{t(`How do I switch projects? (answer)`)}</SText>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`How do I switch chains?`)}</Header3>
            <SText>{t(`How do I switch chains? (answer)`)}</SText>
          </SpacedSection>
          <SpacedSection>
            <Header3>{t(`Starting a project on Spanner`)}</Header3>
            <SText>{t(`Starting a project on Spanner (answer)`)}</SText>
          </SpacedSection>
        </Card>
      </Wrapper>
    </PageWrapper>
  )
}
