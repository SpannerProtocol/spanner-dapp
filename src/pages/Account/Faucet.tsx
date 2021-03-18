import { getFaucet } from 'bridge'
import { ButtonPrimary } from 'components/Button'
import { FlatCardPlate } from 'components/Card'
import TxModal from 'components/Modal/TxModal'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { BorderedWrapper, ButtonWrapper, Section } from 'components/Wrapper'
import useSubscribeBalance from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import useWallet from 'hooks/useWallet'
import React, { useState } from 'react'
import { formatToUnit } from 'utils/formatUnit'

export default function Faucet(): JSX.Element {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [txPendingMsg, setTxPendingMsg] = useState<string | undefined>()
  const [txError, setTxError] = useState<string | undefined>()
  const wallet = useWallet()
  const wusdBalance = useSubscribeBalance({ Token: 'WUSD' })
  const boltBalance = useSubscribeBalance({ Token: 'BOLT' })

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

  const dismissModal = () => {
    setModalOpen(false)
    setTxPendingMsg(undefined)
    setTxHash(undefined)
    setTxError(undefined)
  }

  return (
    <>
      <TxModal
        isOpen={modalOpen}
        onDismiss={dismissModal}
        onConfirm={() => undefined}
        title={'Bridge to Ethereum (USDT)'}
        buttonText={'Confirm'}
        txError={txError}
        txHash={txHash}
        txPending={txPendingMsg}
      >
        {/* <BridgeTxConfirm withdrawAmount={ethWithdrawAmount} withdrawAddress={ethWithdrawAddr} errorMsg={txError} /> */}
        <></>
      </TxModal>
      {!wallet?.address ? (
        <>
          <FlatCardPlate
            style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
          >
            <StandardText>Connect to your Custodial Wallet (for Ethereum) to use the Faucet.</StandardText>
          </FlatCardPlate>
        </>
      ) : (
        <>
          <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Section>
              <RowBetween>
                <SectionHeading>{'Faucet: Get Hammer BOLT'}</SectionHeading>
              </RowBetween>
            </Section>
            <Section>
              <StandardText>Balances</StandardText>
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
              <StandardText>Click the button below to add Hammer BOLT to your custodial wallet.</StandardText>
              <StandardText>Note, this is just for testing transactions on Spanner's Hammer testnet.</StandardText>
              <ButtonWrapper style={{ width: '100px', marginTop: '1rem' }}>
                <ButtonPrimary padding="0.45rem" fontSize="12px" onClick={handleFaucet}>
                  Use Faucet
                </ButtonPrimary>
              </ButtonWrapper>
            </Section>
          </FlatCardPlate>
        </>
      )}
    </>
  )
}
