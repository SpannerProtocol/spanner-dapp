import Card, { FlatCard } from 'components/Card'
import ImageLightBox from 'components/LightBox'
import { AnyQuestionHelper } from 'components/QuestionHelper'
import { SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import BulletTrainDiagram from '../../assets/images/bullettrain-rules.png'
import Text, { HeavyText, SectionHeading, SectionTitle } from '../../components/Text'

export const Step = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  background: ${({ background, theme }) => (background ? background : theme.primary1)};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    padding: 0.5rem;
  `};
`

export default function BulletTrainInstructions() {
  const { t } = useTranslation()
  return (
    <Wrapper
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FlatCard style={{ textAlign: 'left' }}>
        <SectionHeading>{t(`BulletTrain`)}</SectionHeading>
        <SpacedSection>
          <Text>
            {t(`BulletTrain is a decentralized viral affiliate crowdfunding campaign that projects on Spanner can use to
            grow their communities.`)}
          </Text>
        </SpacedSection>
        <SpacedSection style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <SectionTitle>{t(`How to Participate?`)}</SectionTitle>
          <div style={{ justifyContent: 'center', textAlign: 'center' }}>
            <SpacedSection>
              <HeavyText style={{ paddingBottom: '0.5rem' }}>Step 1: Before Boarding</HeavyText>
              <AnyQuestionHelper
                text={t(
                  `Purchase a Cabin or Create a DPO to crowdfund for it. The Ticket Fare spent will be returned to you when your train ride ends.`
                )}
              >
                <Step>{t(`Buy a Cabin with Ticket Fare`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
            <SpacedSection>
              <HeavyText style={{ paddingBottom: '0.5rem' }}>Step 2: Boarded</HeavyText>
              <AnyQuestionHelper
                text={t(`Get your rewards from the TravelCabin. If you created a DPO, release it to all DPO Members.`)}
              >
                <Step>{t(`Claim your Rewards`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
            <SpacedSection>
              <HeavyText style={{ paddingBottom: '0.5rem' }}>Step 3: Journey Ends</HeavyText>
              <AnyQuestionHelper text={t(`The ride is over, withdraw your Ticket Fare back.`)}>
                <Step>{t(`Withdraw Ticket Fare`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
          </div>
        </SpacedSection>

        {/* <SpacedSection>
          <SectionTitle>{t(`How to Participate?`)}</SectionTitle>
          <Text>{t(`1. Purchase a Cabin or start a DPO to crowdfund for it (it is just a deposit).`)}</Text>
          <Text>{t(`2. Funds from your wallet or from your DPO is deposited as Ticket Fare in your Cabin.`)}</Text>
          <Text>
            {t(
              `3. Withdraw/Release rewards from the Cabin to your wallet or to your DPO. If DPO, withdraw from DPO to all member wallets or vaults. Do this periodically as yields generate from the Cabin.`
            )}
          </Text>
          <Text>{t(`4. Withdraw/Release your Ticket Fare back.`)}</Text>
        </SpacedSection> */}
        <SpacedSection>
          <SectionTitle>{t(`BulletTrain Journey`)}</SectionTitle>
          <Text>
            {t(`The follow diagram shows the different actions that can take place during the BulletTrain Journey.`)}
          </Text>
          <div>{BulletTrainDiagram && <ImageLightBox imageSrc={BulletTrainDiagram} />}</div>
        </SpacedSection>
      </FlatCard>
    </Wrapper>
  )
}
