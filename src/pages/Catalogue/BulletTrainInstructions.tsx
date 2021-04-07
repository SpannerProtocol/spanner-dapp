import Card, { FlatCard } from 'components/Card'
import ImageLightBox from 'components/LightBox'
import { AnyQuestionHelper } from 'components/QuestionHelper'
import { SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import BulletTrainDiagram from '../../assets/images/bullettrain-rules.png'
import { HeavyText, SectionHeading, SectionTitle, StandardText } from '../../components/Text'

export const Step = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  background: ${({ background, theme }) => (background ? background : theme.primary1)};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
    font-size: 12px;
  `};
`

const StepNumber = styled.div`
  background: ${({ theme }) => theme.text4};
  color: #fff;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex; /* or inline-flex */
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
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
          <StandardText>
            {t(`BulletTrain is a decentralized viral affiliate crowdfunding campaign that projects can use to
            grow their communities.`)}
          </StandardText>
        </SpacedSection>
        <SpacedSection style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <SectionTitle>{t(`How to Participate?`)}</SectionTitle>
          <SpacedSection>{t(`Click on following buttons for tips and directions!`)}</SpacedSection>
          <div style={{ justifyContent: 'left', textAlign: 'left' }}>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>1</StepNumber>
                <HeavyText>{t(`Before Boarding`)}</HeavyText>
              </div>

              <AnyQuestionHelper
                text={t(
                  `Purchase a Cabin or Create a DPO to crowdfund for it. The Ticket Fare spent will be returned to you when your train ride ends.`
                )}
              >
                <Step>{t(`Buy a Cabin with Ticket Fare`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>2</StepNumber>
                <HeavyText>Boarded</HeavyText>
              </div>
              <AnyQuestionHelper
                text={t(`Get your rewards from the TravelCabin. If you created a DPO, release it to all DPO Members.`)}
              >
                <Step>{t(`Claim your Rewards`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>3</StepNumber>
                <HeavyText>Journey Ends</HeavyText>
              </div>
              <AnyQuestionHelper text={t(`The ride is over, withdraw your Ticket Fare back.`)}>
                <Step>{t(`Withdraw Ticket Fare`)}</Step>
              </AnyQuestionHelper>
            </SpacedSection>
          </div>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>{t(`BulletTrain Journey`)}</SectionTitle>
          <StandardText>
            {t(`The follow diagram shows the different actions that can take place during the BulletTrain Journey.`)}
          </StandardText>
          <div>{BulletTrainDiagram && <ImageLightBox imageSrc={BulletTrainDiagram} />}</div>
        </SpacedSection>
      </FlatCard>
    </Wrapper>
  )
}
