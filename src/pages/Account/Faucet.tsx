import { getFaucet } from 'bridge'
import { ButtonPrimary } from 'components/Button'
import { FlatCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { BorderedWrapper, ButtonWrapper, Section } from 'components/Wrapper'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { formatToUnit } from 'utils/formatUnit'

export default function Faucet(): JSX.Element {
  const wallet = useWallet()
  const wusdBalance = useSubscribeBalance('WUSD')
  const boltBalance = useSubscribeBalance('BOLT')
  const { t } = useTranslation()

  const { chainDecimals } = useSubstrate()
  const { chain } = useChainState()

  const handleFaucet = useCallback(() => {
    // global error
    if (!wallet?.address || !chain) return
    try {
      getFaucet(chain.chain, wallet.address, 'BOLT,WUSD')
    } catch (err) {
      console.log('Faucet Error: ', err)
    }
  }, [chain, wallet])

  return (
    <>
      {!wallet?.address ? (
        <>
          <FlatCard
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>{t(`Connect to your Custodial Wallet (for Ethereum) to use the Faucet.`)}</StandardText>
          </FlatCard>
        </>
      ) : (
        <>
          <FlatCard style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
          </FlatCard>
        </>
      )}
    </>
  )
}
