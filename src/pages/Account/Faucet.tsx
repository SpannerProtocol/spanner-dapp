import { getFaucet } from 'bridge'
import { ButtonPrimary } from 'components/Button'
import { FlatCardPlate } from 'components/Card'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { BorderedWrapper, ButtonWrapper, Section } from 'components/Wrapper'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'

export default function Faucet(): JSX.Element {
  const wallet = useWallet()
  const wusdBalance = useSubscribeBalance({ Token: 'WUSD' })
  const boltBalance = useSubscribeBalance({ Token: 'BOLT' })
  const { t } = useTranslation()

  const { chainDecimals } = useSubstrate()

  const handleFaucet = () => {
    // global error
    if (!wallet?.address) return
    try {
      getFaucet(wallet.address, 'BOLT,WUSD')
    } catch (err) {
      console.log('Faucet Error: ', err)
    }
  }

  return (
    <>
      {!wallet?.address ? (
        <>
          <FlatCardPlate
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>{t(`Connect to your Custodial Wallet (for Ethereum) to use the Faucet.`)}</StandardText>
          </FlatCardPlate>
        </>
      ) : (
        <>
          <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <RowBetween>
                <SectionHeading>{t(`Faucet: Get Hammer BOLT`)}</SectionHeading>
              </RowBetween>
            </Section>
            <Section>
              <StandardText>{t(`Balances`)}</StandardText>
              <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                <RowBetween>
                  <StandardText>BOLT</StandardText>
                  <StandardText>{formatToUnit(boltBalance, chainDecimals, 2)}</StandardText>
                </RowBetween>
              </BorderedWrapper>
              <BorderedWrapper style={{ marginTop: '0.5rem' }}>
                <RowBetween>
                  <StandardText>WUSD</StandardText>
                  <StandardText>{formatToUnit(wusdBalance, chainDecimals, 2)}</StandardText>
                </RowBetween>
              </BorderedWrapper>
            </Section>
            <Section>
              <StandardText>{t(`Click the button below to add Hammer BOLT to your custodial wallet.`)}</StandardText>
              <StandardText>
                {t(`Note, this is just for testing transactions on Spanner's Hammer testnet.`)}
              </StandardText>
              <ButtonWrapper style={{ width: '100px', marginTop: '1rem' }}>
                <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={handleFaucet}>
                  {t(`Use Faucet`)}
                </ButtonPrimary>
              </ButtonWrapper>
            </Section>
          </FlatCardPlate>
        </>
      )}
    </>
  )
}
