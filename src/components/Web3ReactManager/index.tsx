import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { network } from '../../connectors'
import { useEagerConnect, useInactiveListener } from '../../hooks'
import { NetworkContextName } from '../../constants'
import Loader from '../Loader'
import { useWalletManager } from 'state/wallet/hooks'
import { getCustodialAddr } from 'bridge'
import { useChainState, useConnectionsState } from 'state/connections/hooks'
import { AxiosError } from 'axios'
import Modal from 'components/Modal'
import {
  Wrapper,
  CloseColor,
  CloseIcon,
  HeaderRow,
  HoverText,
  UpperSection,
  ContentWrapper,
} from 'components/WalletModal'

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
`

const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { t } = useTranslation()
  const { active, account } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)
  const { setWalletType } = useWalletManager()
  const connectionState = useConnectionsState()
  const [custodialError, setCustodialError] = useState<boolean>(false)
  const { chain } = useChainState()

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network)
    }
    if (account && chain) {
      getCustodialAddr(chain.chain, account)
        .then((response) => {
          setWalletType({
            type: 'custodial',
            address: account,
            custodialAddress: response.data,
          })
        })
        .catch((e: AxiosError) => {
          if (e.name === 'Error' && e.message === 'Network Error') {
            console.log('Error occured when getting custodial address from server:', e.message)
            setCustodialError(true)
          }
        })
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active, account, setWalletType, connectionState, chain])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <MessageWrapper>
        <Message>{t('unknownError')}</Message>
      </MessageWrapper>
    )
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? (
      <MessageWrapper>
        <Loader />
      </MessageWrapper>
    ) : null
  }

  return (
    <>
      <Modal isOpen={custodialError} onDismiss={() => setCustodialError(false)} minHeight={false} maxHeight={90}>
        <Wrapper>
          <UpperSection>
            <CloseIcon onClick={() => setCustodialError(false)}>
              <CloseColor />
            </CloseIcon>
            <HeaderRow>
              <HoverText>{t(`Error connecting`)}</HoverText>
            </HeaderRow>
            <ContentWrapper style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
              {t(`Our custodial wallet service is currently unavailable. Please choose a Spanner wallet.`)}
            </ContentWrapper>
          </UpperSection>
        </Wrapper>
      </Modal>
      {children}
    </>
  )
}
