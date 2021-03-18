import { FlatCardPlate } from 'components/Card'
import ImageLightBox from 'components/LightBox'
import { SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import BulletTrainDiagram from '../../assets/images/bullettrain-rules.png'
import Text, { Heading, SectionTitle } from '../../components/Text'

export default function BulletTrainInstructions() {
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
        <Heading>BulletTrain</Heading>
        <SpacedSection>
          <Text>
            {`BulletTrain is a decentralized viral affiliate crowdfunding campaign that projects on Spanner can use to
            grow their communities.`}
          </Text>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>How to Participate?</SectionTitle>
          <Text>{`1. Purchase a Cabin or start a DPO to crowdfund for it (it is just a deposit).`}</Text>
          <Text>{`2. Funds from your wallet or from your DPO is deposited as Ticket Fare in your Cabin`}</Text>
          <Text>{`3. Withdraw/Release rewards from the Cabin to your wallet or to your DPO. 
          If DPO, withdraw from DPO to all member wallets or vaults. Do this periodically as yields generate from the Cabin.`}</Text>
          <Text>{`4. Withdraw/Release your Ticket Fare back.`}</Text>
        </SpacedSection>
        <SpacedSection>
          <SectionTitle>BulletTrain Journey</SectionTitle>
          <Text>
            {`The follow diagram shows the different actions that can take place during the BulletTrain Journey.`}
          </Text>
          <div>
            {BulletTrainDiagram && (
              <ImageLightBox imageSrc={BulletTrainDiagram} />
              // <img style={{ width: '100%', padding: '0.5rem' }} src={BulletTrainDiagram} alt="bullet train diagram" />
            )}
          </div>
        </SpacedSection>
      </FlatCardPlate>
    </Wrapper>
  )
}
