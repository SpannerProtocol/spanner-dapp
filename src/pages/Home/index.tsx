import { FlatCard } from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { Step, StepNumber } from 'components/InstructionSteps'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import Web3Status from 'components/Web3Status/Web3Substrate'
import { BorderedWrapper, ContentWrapper, PageWrapper, Section, SpacedSection, Wrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import truncateString from 'utils/truncateString'
import { SText, Heading, HeavyText, SectionTitle } from '../../components/Text'

const HomePageTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 0.5rem;
  color: ${({ theme }) => theme.black};
`

export default function Home() {
  const { lastBlock, expectedBlockTime } = useBlockManager()
  const constants = useSubstrate()
  const { chain, genesis } = constants
  const { t } = useTranslation()

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '640px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlatCard>
          <Section style={{ marginBottom: '1rem' }}>
            <HomePageTitle>{t(`Spanner Dapp`)}</HomePageTitle>
            <Heading>{t(`Dapp for Decentralized Collaboration`)}</Heading>
          </Section>
          <SpacedSection style={{ wordBreak: 'break-word' }}>
            <SectionTitle>{t(`Blockchain Info`)}</SectionTitle>
            <BorderedWrapper style={{ marginTop: '0' }}>
              <RowBetween>
                <HeavyText fontSize="14px">{t(`Connected to`)}:</HeavyText>
                <SText>{chain}</SText>
              </RowBetween>
              {genesis && (
                <RowBetween>
                  <HeavyText fontSize="14px">{t(`Genesis Hash`)}:</HeavyText>
                  <CopyHelper toCopy={genesis} childrenIsIcon={true}>
                    <SText color="#565A69">{truncateString(genesis)}</SText>
                  </CopyHelper>
                </RowBetween>
              )}
              {expectedBlockTime && (
                <RowBetween>
                  <HeavyText fontSize="14px">{t(`Estimated Time per Block`)}:</HeavyText>
                  <SText>{`${expectedBlockTime.toNumber() / 1000} ${t(`seconds`)}`}</SText>
                </RowBetween>
              )}
            </BorderedWrapper>
          </SpacedSection>
          <SpacedSection>
            {lastBlock && (
              <div style={{ display: 'block', width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                <HeavyText style={{ width: '100%' }}>{t(`# of Blocks Finalized`)}</HeavyText>
                <Heading style={{ fontSize: '28px' }}>{lastBlock.toString()}</Heading>
              </div>
            )}
          </SpacedSection>
        </FlatCard>
        <ContentWrapper>
          <FlatCard style={{ textAlign: 'left' }}>
            <div
              style={{
                display: 'block',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                paddingBottom: '0.5rem',
              }}
            >
              <SectionTitle>{t(`Get Started`)}</SectionTitle>
              <SText>
                {t(`Follow the steps below to get BOLT and additional rewards from Spanner's BulletTrain campaign.`)}
              </SText>
            </div>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>1</StepNumber>
                <HeavyText fontSize="12px">{t(`Connect to a Wallet`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(
                    `Press Connect to a Wallet next to the Account button. If you see a wallet address (e.g. 5JEJ3...i6NwF) then you are already connected.`
                  )}
                />
              </div>
              <div style={{ width: 'fit-content', margin: 'auto' }}>
                <Web3Status />
              </div>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>2</StepNumber>
                <HeavyText fontSize="12px">{t(`Deposit tokens to Spanner`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(`Use our Ethereum Bridge to exchange Ethereum USDT for Spanner WUSD.`)}
                />
              </div>
              <Link
                to={{ pathname: '/account/bridge' }}
                style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}
              >
                <Step>{t(`Use Bridge to deposit`)}</Step>
              </Link>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>3</StepNumber>
                <HeavyText fontSize="12px">{t(`Swap WUSD for BOLT`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(`Swap WUSD for BOLT at our Decentralized Exchange (DEX).`)}
                />
              </div>
              <Link to={{ pathname: '/dex' }} style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}>
                <Step>{t(`Get BOLT at DEX`)}</Step>
              </Link>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>4</StepNumber>
                <HeavyText fontSize="12px">{t(`Board our BulletTrain and get rewarded!`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(`Get rewarded by buying TravelCabins. Get rewarded more by buyin them as a DPO community!`)}
                />
              </div>
              <Link
                to={{ pathname: '/bullettrain' }}
                style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}
              >
                <Step>{t(`Get aboard Spanner's BulletTrain`)}</Step>
              </Link>
            </SpacedSection>
          </FlatCard>
        </ContentWrapper>
      </Wrapper>
    </PageWrapper>
  )
}
