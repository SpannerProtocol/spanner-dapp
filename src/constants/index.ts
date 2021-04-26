import { AbstractConnector } from '@web3-react/abstract-connector'
import { injected, walletconnect } from '../connectors'
import ReleaseIcon from '../assets/svg/icon-release.svg'
import TicketIcon from '../assets/svg/icon-ticket.svg'
import WithdrawIcon from '../assets/svg/icon-withdraw.svg'
import BronzeIcon from '../assets/svg/icon-bronze.svg'
import SilverIcon from '../assets/svg/icon-silver.svg'
import GoldIcon from '../assets/svg/icon-gold.svg'
import PlatinumIcon from '../assets/svg/icon-platinum.svg'
import DiamondIcon from '../assets/svg/icon-diamond.svg'

export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 14
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'

export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'

const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [UNI_ADDRESS]: 'UNI',
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock',
}

// Spanner Chains
export const DAPP_HOST =
  process.env.NODE_ENV === 'development'
    ? `${window.location.hostname}:${window.location.port}`
    : process.env.REACT_APP_HOST_NAME
export const SPANNER_PROVIDER_SOCKET = process.env.REACT_APP_SPANNER_PROVIDER_SOCKET
export const HAMMER_PROVIDER_SOCKET = process.env.REACT_APP_HAMMER_PROVIDER_SOCKET
export const SPANNER_SUPPORTED_CHAINS = [
  {
    id: 'Spanner',
    chain: 'Spanner Mainnet',
    providerSocket: SPANNER_PROVIDER_SOCKET,
  },
  {
    id: 'Hammer',
    chain: 'Hammer Testnet',
    providerSocket: HAMMER_PROVIDER_SOCKET,
  },
]
// Spanner Block Explorers
export const SPANNER_EXPLORER = process.env.REACT_APP_SPANNER_EXPLORER_URL
export const HAMMER_EXPLORER = process.env.REACT_APP_HAMMER_EXPLORER_URL

// BulletTrain
export const TRAVELCABIN_CLASSES: { [index: string]: any } = {
  Bronze: { name: 'Bronze', image: BronzeIcon, order: 0 },
  Silver: { name: 'Silver', image: SilverIcon, order: 1 },
  Gold: { name: 'Gold', image: GoldIcon, order: 2 },
  Platinum: { name: 'Platinum', image: PlatinumIcon, order: 3 },
  Diamond: { name: 'Diamond', image: DiamondIcon, order: 4 },
}

export const DPO_COMMIT_GRACE_BLOCKS = 86_400
export const DPO_RELEASE_DROP_GRACE_BLOCKS = 201_600

export const ACTION_ICONS: { [index: string]: any } = {
  releaseBonusFromDpo: ReleaseIcon,
  releaseYieldFromDpo: ReleaseIcon,
  releaseFareFromDpo: WithdrawIcon,
  withdrawFareFromTravelCabin: WithdrawIcon,
  dpoBuyTravelCabin: TicketIcon,
  dpoBuyDpoSeats: TicketIcon,
  withdrawYieldFromTravelCabin: WithdrawIcon,
}

export const DPO_STATE_TOOLTIPS: { [index: string]: any } = {
  CREATED: `Crowdfund created. All seats must be bought before the End block.`,
  ACTIVE: `Successfully Crowdfunded! Waiting for Target to be purchased.`,
  RUNNING: `Currently receiving yield. Members can Withdraw from Target and Release to Members.`,
  COMPLETED: `Crowdfunding completed and all Deposits and Rewards have been withdrawn.`,
  FAILED: `Failed to succesfully crowdfund for target before the End block. Withdraw your deposits if still in Vault.`,
}

export const DPO_STATE_COLORS: { [index: string]: any } = {
  CREATED: `#FF9E04`,
  ACTIVE: `#FFBE2E`,
  RUNNING: `#8CD88C`,
  COMPLETED: `#5BC85B`,
  FAILED: `#C3C5CB`,
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export interface SpannerWalletInfo {
  connector: () => void
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
}

export const SUPPORTED_SPANNER_WALLETS: { [key: string]: SpannerWalletInfo } = {
  INJECTED: {
    connector: () => undefined,
    name: 'Browser Extensions',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20
