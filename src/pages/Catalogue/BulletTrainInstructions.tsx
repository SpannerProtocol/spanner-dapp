import { FlatCardPlate } from 'components/Card'
import ImageLightBox from 'components/LightBox'
import { SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import BulletTrainDiagram from '../../assets/images/bullettrain-rules.png'
import Text, { Heading, SectionTitle } from '../../components/Text'

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
      <FlatCardPlate style={{ textAlign: 'left' }}>
        <Heading>{t(`BulletTrain`)}</Heading>
        <SpacedSection>
          <Text>
            {t(`BulletTrain is a decentralized viral affiliate crowdfunding campaign that projects on Spanner can use to
            grow their communities.`)}
          </Text>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>{t(`How to Participate?`)}</SectionTitle>
          <Text>{t(`1. Purchase a Cabin or start a DPO to crowdfund for it (it is just a deposit).`)}</Text>
          <Text>{t(`2. Funds from your wallet or from your DPO is deposited as Ticket Fare in your Cabin.`)}</Text>
          <Text>
            {t(
              `3. Withdraw/Release rewards from the Cabin to your wallet or to your DPO. If DPO, withdraw from DPO to all member wallets or vaults. Do this periodically as yields generate from the Cabin.`
            )}
          </Text>
          <Text>{t(`4. Withdraw/Release your Ticket Fare back.`)}</Text>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>{t(`BulletTrain Journey`)}</SectionTitle>
          <Text>
            {t(`The follow diagram shows the different actions that can take place during the BulletTrain Journey.`)}
          </Text>
          <div>{BulletTrainDiagram && <ImageLightBox imageSrc={BulletTrainDiagram} />}</div>
        </SpacedSection>
      </FlatCardPlate>
    </Wrapper>
  )
}
