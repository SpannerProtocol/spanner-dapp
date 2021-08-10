import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import Identicon from 'components/Identicon'
import WalletModal from 'components/WalletModal'
import { injected, walletconnect } from 'connectors'
import useWallet from 'hooks/useWallet'
import { darken, lighten } from 'polished'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useWalletModalToggle } from 'state/application/hooks'
import styled, { css } from 'styled-components'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import SpannerLogo from '../../assets/svg/logo-spanner-gradient.svg'
import { NetworkContextName } from '../../constants'
import { shortenAddr } from '../../utils/truncateString'
import { ButtonPrimary } from '../Button'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonPrimary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`

const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.primary1};
  border: none;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.primary1};
      border: 1px solid ${({ theme }) => theme.primary1};
      color: ${({ theme }) => theme.white};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
        background-color: ${({ theme }) => darken(0.05, theme.primary1)};
        color: ${({ theme }) => darken(0.05, theme.white)};
      }
    `}
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) => (pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2))};

    :focus {
      border: 1px solid ${({ pending, theme }) => (pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3))};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector | string }) {
  if (typeof connector === 'string' && connector === 'Spanner') {
    return <img src={SpannerLogo} style={{ height: '1rem', width: '1rem' }} alt="spanner connection logo" />
  } else {
    if (connector === injected) {
      return <Identicon />
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={''} />
        </IconWrapper>
      )
    }
  }
  return null
}

function Web3StatusInner() {
  const { t } = useTranslation()
  const { account, connector, error } = useWeb3React()
  const wallet = useWallet()
  // const connections = useConnectionsState()

  const toggleWalletModal = useWalletModalToggle()

  if (wallet && wallet.address) {
    if (connector) {
      return (
        <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={false}>
          <Text>{shortenAddr(wallet.address)}</Text>
          <StatusIcon connector={connector} />
        </Web3StatusConnected>
      )
    } else {
      return (
        <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={false}>
          <Text>{shortenAddr(wallet.address)}</Text>
          <StatusIcon connector={'Spanner'} />
        </Web3StatusConnected>
      )
    }
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <Text>{t('Connect to a Wallet')}</Text>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { active } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={undefined} />
    </>
  )
}
