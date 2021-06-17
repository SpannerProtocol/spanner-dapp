import NetworkSelector from 'components/Network'
import Transfer from 'components/Transfer'
import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { User } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useChainState } from 'state/connections/hooks'
import styled from 'styled-components'
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
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { SLink } from '../Link'
import { useMedia } from 'react-use'

import BridgeIcon from '../../assets/svg/icon-bridge-1.svg'
import DpoIconBlack from '../../assets/svg/icon-dpo-black.svg'
// import LaunchpadIconBlack from '../../assets/svg/icon-launchpad-black.svg'
import SwapIconBlack from '../../assets/svg/icon-swap-arrows-black.svg'
import TrainIconBlack from '../../assets/svg/icon-train-black.svg'
import { Collapse } from '@material-ui/core'
import LanguageSwitch from '../LanguageSwitch'

// import DexIcon from '../../assets/svg/icon-dex.svg'
import EarnIcon from '../../assets/svg/icon-earn.svg'
import FaqIcon from '../../assets/svg/icon-faq.svg'
import GuideIcon from '../../assets/svg/icon-guide.svg'
import InfoIcon from '../../assets/svg/icon-info.svg'
import NewsIcon from '../../assets/svg/icon-news.svg'
import ProjectIcon from '../../assets/svg/icon-project.svg'
// import SpaceshipIcon from '../../assets/svg/icon-spaceship.svg'
import ExplorIcon from '../../assets/svg/icon-explore.svg'

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
  justify-content: space-evenly;
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

const MenuBottom = styled.div`
  //position: fixed;
  //bottom: 3rem;
  padding: 1rem 0rem;
  width: 100%;
`

const useStyles = makeStyles({
  drawer: {
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  list: {
    // width: 250
  },
  fullList: {
    width: 'auto',
  },
  nested: {
    paddingLeft: '3rem',
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

const navItems: NavItemDefs[] = [
  {
    text: 'DPOs',
    link: '/bullettrain/dpos',
    iconLink: DpoIconBlack,
    internal: true,
  },
  {
    text: 'Earn',
    link: '',
    iconLink: EarnIcon,
    internal: true,
    children: [
      {
        text: 'BulletTrain',
        link: '/bullettrain/travelcabins',
        iconLink: TrainIconBlack,
        internal: true,
      },
      // {
      //   text: 'SpaceShip',
      //   link: '',
      //   iconLink: SpaceshipIcon,
      //   internal: true,
      //   enable: false
      // }
    ],
  },
  {
    text: 'Bridge',
    link: '/account/bridge',
    iconLink: BridgeIcon,
    internal: true,
  },
  {
    text: 'DEX',
    link: '/dex',
    iconLink: SwapIconBlack,
    internal: true,
  },
  {
    text: 'Projects',
    link: '/projects',
    iconLink: ProjectIcon,
    internal: true,
  },
  {
    text: 'Explorer',
    link: '/projects',
    iconLink: ExplorIcon,
    internal: false,
  },
  {
    text: 'Info',
    link: '',
    iconLink: InfoIcon,
    internal: true,
    children: [
      {
        text: 'News',
        link: '/bullettrain/travelcabins',
        iconLink: NewsIcon,
        internal: true,
      },
      {
        text: 'FAQ',
        link: '/bullettrain/travelcabins',
        iconLink: FaqIcon,
        internal: true,
      },
      {
        text: 'Guides',
        link: '/bullettrain/travelcabins',
        iconLink: GuideIcon,
        internal: true,
      },
    ],
  },
]

interface NavItemDefs {
  iconLink: string
  text: string
  link: string
  internal: boolean
  children?: NavItemDefs[]
  enable?: boolean
}

interface NavItemProps {
  iconLink: string
  text: string
  link: string
  internal: boolean
  nested: boolean
  children?: NavItemDefs[]
  classes: ClassNameMap<'list' | 'fullList' | 'nested'>
  toggleDrawer?: (open: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => void
}

function NavItem({ iconLink, text, link, classes, internal, nested, children, toggleDrawer }: NavItemProps) {
  return (
    <>
      <div
        className={clsx(classes.list, {
          [classes.fullList]: false,
        })}
        role="presentation"
        onClick={children ? undefined : toggleDrawer ? toggleDrawer(false) : undefined}
        onKeyDown={children ? undefined : toggleDrawer ? toggleDrawer(false) : undefined}
      >
        {internal ? (
          <List>
            {children ? (
              <NavItemContent
                iconLink={iconLink}
                text={text}
                link={link}
                internal={internal}
                nested={nested}
                classes={classes}
                toggleDrawer={toggleDrawer}
              />
            ) : (
              <SLink to={link}>
                <NavItemContent
                  iconLink={iconLink}
                  text={text}
                  link={link}
                  internal={internal}
                  nested={nested}
                  classes={classes}
                  toggleDrawer={toggleDrawer}
                />
              </SLink>
            )}
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

export function NavItemContent({
  iconLink,
  text,
  link,
  classes,
  internal,
  nested,
  children,
  toggleDrawer,
}: NavItemProps) {
  const [open, setOpen] = React.useState(false)

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen)
  }
  const { t } = useTranslation()
  return (
    <>
      <ListItem button onClick={handleClick} className={nested ? classes.nested : ''}>
        {iconLink && (
          <ListItemIcon>
            {' '}
            <img width={'18px'} style={{ marginRight: '0.5rem' }} src={iconLink} alt={text} />
          </ListItemIcon>
        )}
        <ListItemText primary={text} />
        {children != null ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItem>
      {children && (
        <Collapse component="li" in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {children.map(function (navItem, index) {
              return (
                <NavItem
                  key={index}
                  iconLink={navItem.iconLink}
                  link={navItem.link}
                  text={t(navItem.text)}
                  internal={navItem.internal}
                  nested={true}
                  classes={classes}
                  toggleDrawer={toggleDrawer}
                />
              )
            })}
          </List>
        </Collapse>
      )}
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
        <Drawer
          classes={{
            paper: classes.drawer,
          }}
          anchor={'right'}
          open={isOpen}
          onClose={toggleDrawer(false)}
        >
          <div style={{ overflow: 'auto' }}>
            <Divider />
            {navItems.map(function (navItem, index) {
              if (chain && chain.chain !== 'Spanner' && navItem.text === 'Bridge') {
                return false
              } else {
                return (
                  <NavItem
                    key={index}
                    iconLink={navItem.iconLink}
                    link={navItem.link}
                    text={t(navItem.text)}
                    internal={navItem.internal}
                    nested={false}
                    classes={classes}
                    children={navItem.children ? navItem.children : undefined}
                    toggleDrawer={toggleDrawer}
                  />
                )
              }
            })}
          </div>
          <MenuBottom>
            <Divider />
            <div style={{ padding: '1rem 0rem 1rem 0rem' }}>
              <NetworkSelector background={'#fff'} />
            </div>
            <HeaderElementWrap>
              <Transfer />
              <LanguageSwitch />
            </HeaderElementWrap>
          </MenuBottom>
        </Drawer>
        {/* </MobileWrapper> */}
      </>
    </HeaderLinks>
  )
}

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
  // let icons = props.icons
  const { t } = useTranslation()
  const classes = useStyles()

  return (
    <HeaderLinks>
      <Divider />
      {navItems.map(function (navItem, index) {
        if (chain && chain.chain !== 'Spanner' && navItem.text === 'Bridge') {
          return false
        } else {
          return (
            <NavItem
              key={index}
              iconLink={navItem.iconLink}
              link={navItem.link}
              text={t(navItem.text)}
              internal={navItem.internal}
              nested={false}
              classes={classes}
              children={navItem.children ? navItem.children : undefined}
              toggleDrawer={undefined}
            />
          )
        }
      })}
      <Divider />
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
