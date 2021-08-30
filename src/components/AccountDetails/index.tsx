import QuestionHelper from 'components/QuestionHelper'
import useWallet from 'hooks/useWallet'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnectionsState } from 'state/connections/hooks'
import styled from 'styled-components'
import { shortenAddr } from 'utils/truncateString'
import PortisIcon from '../../assets/images/portisIcon.png'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected, portis, walletconnect } from '../../connectors'
import { SUPPORTED_WALLETS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import SpannerLogo from '../../assets/svg/logo-spanner-gradient.svg'
import Identicon from '../Identicon'
import Copy from './Copy'

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const InfoCard = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 20px;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`

const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 0rem 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1.5rem 1rem;`};
`

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text3};
`

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const WalletAction = styled(ButtonSecondary)`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const MainWalletAction = styled(WalletAction)`
  color: ${({ theme }) => theme.primary1};
`

interface AccountDetailsProps {
  toggleWalletModal: () => void
  ENSName?: string
  openOptions: () => void
}

export default function AccountDetails({ toggleWalletModal, ENSName, openOptions }: AccountDetailsProps) {
  const { account: ethAccount, connector } = useActiveWeb3React()
  const { t } = useTranslation()
  const connectionState = useConnectionsState()
  const wallet = useWallet()

  useEffect(() => {
    if (connectionState && !connectionState.bridgeServerOn && connector) {
      console.info('No connection to bridge, turning off connector')
      connector.deactivate()
    }
  }, [connectionState, connector])

  function formatConnectorName() {
    const { ethereum } = window
    const isMetaMask = !!(ethereum && ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0]
    return (
      <>
        <div style={{ display: 'flex' }}>
          <WalletName>
            {t(`Connected with`)} {name}
          </WalletName>
          {connector === injected && (
            <QuestionHelper
              size={12}
              backgroundColor={'transparent'}
              text={t(`Go to your Browser Extension Wallet to disconnect with this Wallet.`)}
            />
          )}
        </div>
      </>
    )
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      )
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={'wallet connect logo'} />
        </IconWrapper>
      )
    } else if (connector === portis) {
      return (
        <>
          <IconWrapper size={16}>
            <img src={PortisIcon} alt={'portis logo'} />
            <MainWalletAction
              onClick={() => {
                portis.portis.showPortis()
              }}
            >
              Show Portis
            </MainWalletAction>
          </IconWrapper>
        </>
      )
    }
    return null
  }

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>{t(`Account`)}</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div>
                  {connector !== injected && (
                    <WalletAction
                      style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                      onClick={() => {
                        ;(connector as any).deactivate()
                      }}
                    >
                      {t(`Disconnect`)}
                    </WalletAction>
                  )}
                  <WalletAction
                    style={{ fontSize: '.825rem', fontWeight: 400 }}
                    onClick={() => {
                      openOptions()
                    }}
                  >
                    {t(`Change`)}
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p>{` ${ENSName} (${t(`Ethereum`)})`}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p>{` ${ethAccount && shortenAddress(ethAccount)} (${t(`Ethereum`)})`}</p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {ethAccount && (
                          <Copy toCopy={ethAccount}>
                            <span style={{ marginLeft: '4px' }}>{t(`Copy Address`)}</span>
                          </Copy>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {ethAccount && (
                          <Copy toCopy={ethAccount}>
                            <span style={{ marginLeft: '4px' }}>{t(`Copy Address`)}</span>
                          </Copy>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
              <AccountGroupingRow>
                <AccountControl>
                  <>
                    {wallet && wallet.address && (
                      <div style={{ paddingTop: '1rem' }}>
                        <img
                          src={SpannerLogo}
                          style={{ height: '1.35rem', width: '1.35rem', marginRight: '8px' }}
                          alt="spanner connection logo"
                        />
                        <p>{` ${shortenAddr(wallet.address)} (${t(`Spanner`)})`}</p>
                      </div>
                    )}
                  </>
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                <AccountControl>
                  <div>
                    {wallet && wallet.address && (
                      <Copy toCopy={wallet.address}>
                        <span style={{ marginLeft: '4px' }}>{t(`Copy Address`)}</span>
                      </Copy>
                    )}
                  </div>
                </AccountControl>
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
    </>
  )
}
