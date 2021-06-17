import NetworkSelector from 'components/Network'
import Transfer from 'components/Transfer'
import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { User } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { useChainState } from 'state/connections/hooks'
import styled from 'styled-components'
import BlockIcon from '../../assets/svg/icon-block-black.svg'
import BridgeIcon from '../../assets/svg/icon-bridge-black.svg'
import LaunchpadIcon from '../../assets/svg/icon-launchpad-black.svg'
import SwapIcon from '../../assets/svg/icon-swap-arrows-black.svg'
import TrainIcon from '../../assets/svg/icon-train-black.svg'
import Logo from '../../assets/svg/logo-spanner-gradient.svg'
import hamburgerIcon from '../../assets/svg/icon-hamburger-gradient.svg'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, MEDIA_WIDTHS } from '../../theme'
import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Settings from '../Settings'
import Web3Status from '../Web3Status/Web3Substrate'
import { makeStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import { ClassNameMap } from '@material-ui/styles'
import clsx from 'clsx'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { SLink } from '../Link'
import { useMedia } from 'react-use'

import BridgeIconBlack from '../../assets/svg/icon-bridge-black.svg'
import DpoIcon from '../../assets/svg/icon-dpo.svg'
import LaunchpadIconBlack from '../../assets/svg/icon-launchpad-black.svg'
import SwapIconBlack from '../../assets/svg/icon-swap-arrows-black.svg'
import TrainIconBlack from '../../assets/svg/icon-train-black.svg'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  // border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
  grid-area: control;
  // grid-row-start: control;
  // grid-column-start: control;
  padding-left: 1rem;
  padding-right: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  display: block;
  height: 100%;
  width: 280px;
  position: fixed;
  top: 0;
  left: 0;
  align-items: flex-start;
  background: linear-gradient(180deg, ${({ theme }) => theme.bg1} -11.67%, ${({ theme }) => theme.bg1} 100%);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    align-items: center;
    position: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.bg1} -11.67%, ${({ theme }) => theme.bg1} 100%);
    width: 100%;
    height: inherit;
  `};
`

const HeaderLinks = styled(Row)`
  display: block;
  justify-content: left;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    padding: 0rem 0.5rem 0rem 0.5rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 10px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const BOLTAmount = styled(AccountElement)`
  color: white;
  padding: 0.5rem;
  font-weight: 500;
  background-color: ${({ theme }) => theme.secondary1};
  max-width: 35px;
  max-height: 35px;

  :hover {
    background-color: ${({ theme }) => darken(0.15, theme.secondary1)};
  }

  :focus {
    background-color: ${({ theme }) => darken(0.15, theme.secondary1)};
  }
`

const BalanceWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;
  border-radius: 10px;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

// const HideSmall = styled.span`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     display: none;
//   `};
// `

// const NetworkCard = styled(YellowCard)`
//   border-radius: 12px;
//   padding: 8px 12px;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     margin: 0;
//     margin-right: 0.5rem;
//     width: initial;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     flex-shrink: 1;
//   `};
// `

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
// `

const Title = styled(Link)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  text-decoration: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 0.5rem;
    justify-self: center;
  `};

  :hover {
    cursor: pointer;
  }
`

const SpannerIcon = styled.div`
  margin: 1rem;
  transition: transform 0.3s ease;

  :hover {
    transform: rotate(-5deg);
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin: 0.25rem;
  color: ${({ theme }) => theme.primary1}
`};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
  width: fit-content;
  margin: 1.3rem 1rem 1.3rem 2rem;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    color: ${({ theme }) => theme.text1}
    font-size: 14px;
    padding: 0;
    justify-content: flex-end;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
`};
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
  width: fit-content;
  margin: 1.3rem 1rem 1.3rem 2rem;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: flex;
  color: ${({ theme }) => theme.text1}
  font-size: 14px;
  padding: 0;
  justify-content: flex-end;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
  `}
`

const LogoText = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 22px;
  font-weight: 900;
  font-family: avenir;
  text-decoration: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
`};
`

interface HeaderProps {
  width?: number
}

export default function Header(props: HeaderProps) {
  const { width } = props
  const { t } = useTranslation()

  const [icons, setIcons] = useState<boolean>(false)
  const [subNavNetworkSelector, setSubNavNetworkSelector] = useState<boolean>(false)
  const isMobile = useMedia('(max-width: 720px)')

  useEffect(() => {
    if (width && width > MEDIA_WIDTHS.upToMedium) {
      setIcons(true)
      setSubNavNetworkSelector(true)
    } else {
      setIcons(false)
      setSubNavNetworkSelector(false)
    }
  }, [width])

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title to={{ pathname: '/' }}>
          <SpannerIcon>
            <img width={'40px'} src={(width as number) <= MEDIA_WIDTHS.upToMedium ? Logo : Logo} alt="logo" />
          </SpannerIcon>
          <LogoText>{t(`Spanner Protocol`)}</LogoText>
        </Title>
        {subNavNetworkSelector && <NetworkSelector background={'#fff'} />}
        <>{isMobile ? <MobileNav /> : <DesktopNav icons={icons} />}</>
      </HeaderRow>
    </HeaderFrame>
  )
}

interface DesktopNavProp {
  icons?: boolean
}

export function DesktopNav(props: DesktopNavProp) {
  const { chain } = useChainState()
  const icons = props.icons
  const { t } = useTranslation()

  return (
    <HeaderLinks>
      {/* <StyledNavLink id={`account-nav-link`} to={'/account'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={AccountIcon} alt="account nav icon" />}
            Account
          </StyledNavLink> */}
      {chain && chain.chain === 'Spanner' && (
        <StyledNavLink id={`bridge-nav-link`} to={'/account/bridge'}>
          {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={BridgeIcon} alt="bridge" />}
          {t(`Bridge`)}
        </StyledNavLink>
      )}
      <StyledNavLink id={`dex-nav-link`} to={'/dex'}>
        {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={SwapIcon} alt="dex" />}
        {t(`DEX`)}
      </StyledNavLink>
      <StyledNavLink id={`projects-nav-link`} to={'/projects'}>
        {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={LaunchpadIcon} alt="projects" />}
        {t(`Projects`)}
      </StyledNavLink>
      <StyledNavLink id={`dpos-nav-link`} to={'/dpos'}>
        {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={DpoIcon} alt="dpos" />}
        {t(`DPOs`)}
      </StyledNavLink>
      <StyledNavLink id={`bullettrain-nav-link`} to={'/bullettrain/travelcabins'}>
        {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={TrainIcon} alt="bullettrain" />}
        {t(`BulletTrain`)}
      </StyledNavLink>
      {process.env.REACT_APP_DEBUG_MODE === 'true' && (
        <StyledNavLink id={`diagnostics-nav-link`} to={'/diagnostics'}>
          {`Debug`}
        </StyledNavLink>
      )}
      {chain && chain.url && (
        <StyledExternalLink id={`scan-nav-link`} href={chain.url}>
          {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={BlockIcon} alt="explorer" />}
          {t(`Explorer`)} <span style={{ fontSize: '11px' }}>↗</span>
        </StyledExternalLink>
      )}
    </HeaderLinks>
  )
}

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
})

const HamburgerWrapper = styled.div`
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const navItems = [
  {
    label: 'Bridge',
    link: '/account/bridge',
    iconLink: BridgeIconBlack,
    internal: true,
  },
  {
    label: 'DEX',
    link: '/dex',
    iconLink: SwapIconBlack,
    internal: true,
  },
  {
    label: 'Projects',
    link: '/projects',
    iconLink: LaunchpadIconBlack,
    internal: true,
  },
  {
    label: 'DPOs',
    link: '/dpos',
    iconLink: DpoIcon,
    internal: true,
  },
  {
    label: 'BulletTrain',
    link: '/bullettrain/travelcabins',
    iconLink: TrainIconBlack,
    internal: true,
  },
]

interface NavItemProps {
  iconLink: string
  text: string
  link: string
  internal: boolean
  classes: ClassNameMap<'list' | 'fullList'>
  toggleDrawer: (open: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => void
}

function NavItem({ iconLink, text, link, classes, internal, toggleDrawer }: NavItemProps) {
  return (
    <>
      <div
        className={clsx(classes.list, {
          [classes.fullList]: false,
        })}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        {internal ? (
          <List>
            <SLink to={link}>
              <ListItem button>
                {iconLink && (
                  <ListItemIcon>
                    {' '}
                    <img width={'18px'} style={{ marginRight: '0.5rem' }} src={iconLink} alt={text} />
                  </ListItemIcon>
                )}
                <ListItemText primary={text} />
              </ListItem>
            </SLink>
          </List>
        ) : (
          <List>
            <ExternalLink href={link} target="_blank" download>
              <ListItem button>
                {iconLink && (
                  <ListItemIcon>
                    {' '}
                    <img width={'18px'} style={{ marginRight: '0.5rem' }} src={iconLink} alt={text} />
                  </ListItemIcon>
                )}
                <ListItemText primary={text} />
              </ListItem>
            </ExternalLink>
          </List>
        )}
      </div>
    </>
  )
}

export function MobileNav() {
  const classes = useStyles()
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const { t } = useTranslation()
  const { chain } = useChainState()

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setIsOpen(open)
  }

  return (
    <HeaderLinks>
      <>
        <HamburgerWrapper onClick={toggleDrawer(true)}>
          <img src={hamburgerIcon} width="30px" alt="hamburgerIcon" />
        </HamburgerWrapper>
        <Drawer anchor={'right'} open={isOpen} onClose={toggleDrawer(false)}>
          <Divider />
          {navItems.map(function (navItem, index) {
            if (chain && chain.chain !== 'Spanner' && navItem.label === 'Bridge') {
              return false
            } else {
              return (
                <NavItem
                  key={index}
                  iconLink={navItem.iconLink}
                  link={navItem.link}
                  text={t(navItem.label)}
                  internal={navItem.internal}
                  classes={classes}
                  toggleDrawer={toggleDrawer}
                />
              )
            }
          })}
          <Divider />
        </Drawer>
        {/* </MobileWrapper> */}
      </>
    </HeaderLinks>
  )
}

export function Controls() {
  const { account } = useActiveWeb3React()

  return (
    <>
      <HeaderControls>
        <HeaderElement>
          {true && (
            <Link to="/account/balances" style={{ textDecoration: 'none' }}>
              <BalanceWrapper>
                <BOLTAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                  <User />
                </BOLTAmount>
              </BalanceWrapper>
            </Link>
          )}
          <Web3Status />
        </HeaderElement>
        <HeaderElementWrap>
          <Transfer />
          <Settings />
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </>
  )
}
