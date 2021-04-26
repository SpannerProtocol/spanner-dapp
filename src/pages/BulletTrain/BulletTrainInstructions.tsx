import { FlatCard } from 'components/Card'
import { Step, StepNumber } from 'components/InstructionSteps'
import ImageLightBox from 'components/LightBox'
import QuestionHelper from 'components/QuestionHelper'
import { SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import BulletTrainDiagram from '../../assets/images/bullettrain-rules.png'
import { HeavyText, SectionHeading, SectionTitle, StandardText } from '../../components/Text'

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
        <SpacedSection>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SectionHeading style={{ marginBottom: '0' }}>{t(`BulletTrain`)}</SectionHeading>
            <QuestionHelper
              text={t(`BulletTrain is a decentralized viral affiliate crowdfunding campaign that projects can use to
            grow their communities.`)}
              size={12}
              backgroundColor={'transparent'}
            />
          </div>
          <StandardText>{t(`Begin your BulletTrain journey to receive token Rewards.`)}</StandardText>
        </SpacedSection>
        <SpacedSection>
          <div style={{ justifyContent: 'center', textAlign: 'center' }}>
            <SectionTitle>{t(`How to Participate?`)}</SectionTitle>
          </div>
          <div style={{ justifyContent: 'center', textAlign: 'center' }}>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>1</StepNumber>
                <HeavyText fontSize="14px">{t(`Before Boarding`)}</HeavyText>
                <QuestionHelper
                  size={12}
                  backgroundColor={'transparent'}
                  text={t(
                    `Purchase a Cabin or Create a DPO to crowdfund for it. The Ticket Fare spent will be returned to you when your train ride ends.`
                  )}
                />
              </div>
              <Link
                to={{ pathname: '/bullettrain/travelcabins' }}
                style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}
              >
                <Step>{t(`Buy a Cabin`)}</Step>
              </Link>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>2</StepNumber>
                <HeavyText fontSize="14px">{t(`Boarded`)}</HeavyText>
                <QuestionHelper
                  text={t(
                    `Get your rewards from the TravelCabin. If you created a DPO, release it to all DPO Members.`
                  )}
                  size={12}
                  backgroundColor={'transparent'}
                />
              </div>
              <Link
                to={{ pathname: '/account/portfolio' }}
                style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}
              >
                <Step>{t(`Claim your Rewards`)}</Step>
              </Link>
            </SpacedSection>
            <SpacedSection>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                <StepNumber>3</StepNumber>
                <HeavyText fontSize="14px">{t(`Journey Ends`)}</HeavyText>
                <QuestionHelper
                  text={t(`The ride is over, withdraw your Ticket Fare back.`)}
                  size={12}
                  backgroundColor={'transparent'}
                />
              </div>
              <Link
                to={{ pathname: '/account/portfolio' }}
                style={{ textDecoration: 'none', width: 'fit-content', margin: 'auto' }}
              >
                <Step>{t(`Withdraw Ticket Fare`)}</Step>
              </Link>
            </SpacedSection>
          </div>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>{t(`BulletTrain Journey`)}</SectionTitle>
          <div>{BulletTrainDiagram && <ImageLightBox imageSrc={BulletTrainDiagram} />}</div>
        </SpacedSection>
      </FlatCard>
    </Wrapper>
  )
}
