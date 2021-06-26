import Card from 'components/Card'
import { PageWrapper, TextSection } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Header1, Header3, SText } from '../../components/Text'

export default function Faq() {
  const { t } = useTranslation()
  return (
    <PageWrapper style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
      <Card>
        <Header1>{t(`Frequently Asked Questions`)}</Header1>
        <TextSection>
          <Header3 id="login">{t(`How do I login to Spanner's DApp?`)}</Header3>
          <SText>{t(`How do I login to Spanner's DApp? (answer)`)}</SText>
        </TextSection>
        <TextSection>
          <Header3 id="get-tokens">{t(`How do I get tokens on Spanner?`)}</Header3>
          <SText>{t(`How do I get tokens on Spanner? (answer)`)}</SText>
        </TextSection>
        <TextSection>
          <Header3 id="switch-chains">{t(`How do I switch chains?`)}</Header3>
          <SText>{t(`How do I switch chains? (answer)`)}</SText>
        </TextSection>
        <TextSection>
          <Header3 id="start-projects">{t(`Starting a project on Spanner`)}</Header3>
          <SText>{t(`Starting a project on Spanner (answer)`)}</SText>
        </TextSection>
        <TextSection>
          <Header3 id="how-to-swap">{t(`What is a DEX and how does Swap work?`)}</Header3>
          <SText>{t(`What is a DEX and how does Swap work? (answer)`)}</SText>
        </TextSection>
      </Card>
    </PageWrapper>
  )
}
