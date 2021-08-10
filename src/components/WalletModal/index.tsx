import { isWeb3Injected } from '@polkadot/extension-dapp'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AxiosError } from 'axios'
import { getCustodialAddr } from 'bridge'
import { HeavyText, Header2, SText } from 'components/Text'
import { BorderedSelection, Section } from 'components/Wrapper'
import { useWeb3Accounts } from 'hooks/useWeb3Accounts'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useChainState } from 'state/connections/hooks'
import { useIsDarkMode } from 'state/user/hooks'
import { useWalletManager } from 'state/wallet/hooks'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import MathBlackIcon from '../../assets/svg/logo-math-black.svg'
import MathWhiteIcon from '../../assets/svg/logo-math-white.svg'
import PolkadotJsIcon from '../../assets/svg/logo-polkadotjs.svg'
import { injected, portis } from '../../connectors'
import { SUPPORTED_SPANNER_WALLETS, SUPPORTED_WALLETS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import Option from './Option'
import PendingView, {
  ErrorButton,
  ErrorGroup,
  LoadingMessage,
  LoadingWrapper,
  PendingSection,
  StyledLoader,
} from './PendingView'

export const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

export const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

export const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

export const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 2rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

export const UpperSection = styled.div`
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

const Blurb = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

export const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

function SpannerAccountSelectModal({
  accounts,
  title,
  isOpen,
  pending,
  onDismiss,
  selectAccount,
  errorMsg,
  createConnection,
}: {
  accounts: Array<InjectedAccountWithMeta> | undefined
  title: string
  isOpen: boolean
  pending: boolean
  onDismiss: () => void
  selectAccount: (account: InjectedAccountWithMeta) => void
  errorMsg?: string
  createConnection: () => void
}) {
  const error = errorMsg ? true : false
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} minHeight={false} maxHeight={90}>
      <UpperSection style={{ width: '100%' }}>
        <HeaderRow>
          <HoverText>{title}</HoverText>
        </HeaderRow>
        <ContentWrapper>
          <Section style={{ textAlign: 'center' }}>
            <SText style={{ margin: '0' }}>{t(`Select an address below to use in Spanner Dapp.`)}</SText>
          </Section>
          {pending && (
            <PendingSection>
              <LoadingMessage error={error}>
                <LoadingWrapper>
                  {error ? (
                    <ErrorGroup>
                      <div>{errorMsg}</div>
                      <ErrorButton onClick={() => createConnection()}>{t(`Try Again`)}</ErrorButton>
                    </ErrorGroup>
                  ) : (
                    <>
                      <StyledLoader />
                      {t(`Initializing`)}...
                    </>
                  )}
                </LoadingWrapper>
              </LoadingMessage>
            </PendingSection>
          )}
          <Section>
            {accounts &&
              accounts.map((account, index) => {
                return (
                  <BorderedSelection
                    key={index}
                    onClick={() => selectAccount(account)}
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      marginTop: '0.35rem',
                      marginBottom: '0.35rem',
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                  >
                    <HeavyText fontSize={'11px'}>{account.address}</HeavyText>
                  </BorderedSelection>
                )
              })}
          </Section>
        </ContentWrapper>
      </UpperSection>
    </Modal>
  )
}

export default function WalletModal({ ENSName }: { ENSName?: string }) {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  const { allAccounts, createConnection, selectAccount, errorMsg, activeAccount } = useWeb3Accounts()
  const [openAccountSelectModal, setOpenAccountSelectModal] = useState(false)
  const [spannerWalletActive, setSpannerWalletActive] = useState(false)
  const isDarkMode = useIsDarkMode()
  const { setWalletType } = useWalletManager()

  const [isCustodial, setIsCustodial] = useState<boolean | undefined>()
  const { chain } = useChainState()

  const { t } = useTranslation()

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
      setIsCustodial(true)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    // let name = ''
    Object.keys(SUPPORTED_WALLETS).forEach((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return SUPPORTED_WALLETS[key].name
      }
      return true
    })
    setPendingWallet(connector)
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true)
        }
      })
  }

  // After Web3Enable, all injected accounts will be loaded for user to select
  useEffect(() => {
    if (!allAccounts) return
    setOpenAccountSelectModal(true)
  }, [allAccounts])

  useEffect(() => {
    if (!chain) return
    if (typeof isCustodial === 'undefined') return
    if (isCustodial) {
      if (!account) return
      // Get custodial address and set it in the wallet
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
          }
        })
    } else {
      if (!activeAccount) return
      setWalletType({ type: 'non-custodial', address: activeAccount.address })
    }
  }, [isCustodial, account, activeAccount, setWalletType, chain])

  const handleAccountSelection = () => {
    toggleWalletModal()
    setOpenAccountSelectModal(true)
    createConnection()
  }

  const handleAccountSelected = (account: InjectedAccountWithMeta) => {
    selectAccount(account)
    setSpannerWalletActive(true)
    setOpenAccountSelectModal(false)
    setIsCustodial(false)
  }

  const closeAccountSelectModal = () => setOpenAccountSelectModal(false)

  // get wallets user can switch too, depending on device/browser
  function getEthOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require(`assets/images/${option.iconName}`).default}
            />
          )
        }

        if (window.web3 && window.ethereum && option.mobile) {
          return (
            <Option
              id={`connect-${key}`}
              onClick={() => {
                option.connector === connector
                  ? setWalletView(WALLET_VIEWS.ACCOUNT)
                  : !option.href && tryActivation(option.connector)
              }}
              key={key}
              active={option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null} //use option.descriptio to bring back multi-line
              icon={require(`assets/images/${option.iconName}`).default}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require(`assets/images/${option.iconName}`).default}
          />
        )
      )
    })
  }

  function getSpannerOptions({ onClick }: { onClick: () => void }) {
    return Object.keys(SUPPORTED_SPANNER_WALLETS).map((key) => {
      const option = SUPPORTED_SPANNER_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        if (!isWeb3Injected && option.mobile) {
          return (
            <Option
              onClick={onClick}
              id={`connect-${key}`}
              key={key}
              active={spannerWalletActive}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require(`assets/images/${option.iconName}`).default}
            />
          )
        }
        return null
      }

      if (Object.keys(window.injectedWeb3).length === 0 || !window.injectedWeb3) {
        return (
          <>
            <Option
              id={`connect-${key}`}
              key={key}
              color={'#E8831D'}
              header={'Install MathWallet'}
              subheader={null}
              link={'https://mathwallet.org/'}
              icon={isDarkMode ? MathWhiteIcon : MathBlackIcon}
            />
            <Option
              id={`connect-${key}`}
              key={key}
              color={'#E8831D'}
              header={'Install Polkadot.js'}
              subheader={null}
              link={'https://polkadot.js.org/extension/'}
              icon={PolkadotJsIcon}
            />
          </>
        )
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={onClick}
            key={key}
            active={spannerWalletActive}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require(`assets/images/${option.iconName}`).default}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleWalletModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? t(`Wrong Network`) : t(`Error connecting`)}</HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>{t(`Please connect to the appropriate Ethereum network.`)}</h5>
            ) : (
              t(`Error connecting. Try refreshing the page.`)
            )}
          </ContentWrapper>
        </UpperSection>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false)
                setWalletView(WALLET_VIEWS.ACCOUNT)
              }}
            >
              {t(`Back`)}
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>{t(`Connect to wallets`)}</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <>
              <Header2>{t(`Connect to Spanner wallet`)}</Header2>
              <OptionGrid>{getSpannerOptions({ onClick: handleAccountSelection })}</OptionGrid>
              <Header2 style={{ marginTop: '1rem' }}>{t(`Connect to Ethereum wallet`)}</Header2>
              <OptionGrid>{getEthOptions()}</OptionGrid>
            </>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>{t(`New to Spanner?`)}&nbsp;</span>{' '}
              <ExternalLink href="#">{t(`Learn more about Spanner native and custodial wallets`)}</ExternalLink>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <>
      <SpannerAccountSelectModal
        title={'Select Address from Wallet Extensions'}
        isOpen={openAccountSelectModal}
        onDismiss={closeAccountSelectModal}
        selectAccount={handleAccountSelected}
        pending={false}
        accounts={allAccounts}
        createConnection={createConnection}
        errorMsg={errorMsg}
      />
      <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
        <Wrapper>{getModalContent()}</Wrapper>
      </Modal>
    </>
  )
}
