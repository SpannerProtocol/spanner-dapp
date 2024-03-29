import { Badge, Collapse } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { ClassNameMap } from '@material-ui/styles'
import clsx from 'clsx'
import Transfer from 'components/Transfer'
import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { User } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useMedia } from 'react-use'
import { useChainState } from 'state/connections/hooks'
import styled from 'styled-components'
import BridgeIcon from '../../assets/svg/icon-bridge.svg'
import DpoIcon from '../../assets/svg/icon-dpo.svg'
import DexIcon from '../../assets/svg/icon-dex.svg'
import EarnIcon from '../../assets/svg/icon-earn.svg'
import ExplorerIcon from '../../assets/svg/icon-explorer.svg'
import FaqIcon from '../../assets/svg/icon-faq.svg'
import HamburgerIcon from '../../assets/svg/icon-hamburger-gradient.svg'
import InfoIcon from '../../assets/svg/icon-info.svg'
import ProjectIcon from '../../assets/svg/icon-projects.svg'
import BulletTrainIcon from '../../assets/svg/icon-bullettrain.svg'
import Logo from '../../assets/svg/logo-spanner-gradient.svg'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, MEDIA_WIDTHS } from '../../theme'
import LanguageSwitch from '../LanguageSwitch'
import { SLink } from '../Link'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status/Web3Substrate'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  box-shadow: 0px 6px 15px #2b2f4a19;
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
    display: none;
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
  justify-content: flex-start;
  padding: 1rem;
`

const HeaderRow = styled(RowFixed)`
  //display: block;
  height: 100%;
  width: 280px;
  position: fixed;
  top: 0;
  left: 0;
  align-items: flex-start;
  background: linear-gradient(180deg, ${({ theme }) => theme.bg1} -11.67%, ${({ theme }) => theme.bg1} 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    align-items: center;
    position: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.bg1} -11.67%, ${({ theme }) => theme.bg1} 100%);
    width: 100%;
    height: inherit;
    flex-direction: row;
    justify-content: flex-start;
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
  background-color: ${({ theme }) => theme.primary1};
  max-width: 35px;
  max-height: 35px;

  :hover {
    background-color: ${({ theme }) => darken(0.15, theme.primary1)};
  }

  :focus {
    background-color: ${({ theme }) => darken(0.15, theme.primary1)};
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
  padding: 1rem 0;
  width: 100%;
`

interface HeaderProps {
  width?: number
}

function SelectNavItem(pathname: string, naviItems: NavItemDefs[]): boolean {
  let isSelected = false
  naviItems.forEach((item) => {
    if (item.children) {
      const isChildrenSelected = SelectNavItem(pathname, item.children)
      if (isChildrenSelected) {
        item.selected = true
        isSelected = true
      }
    } else {
      if (pathname === '') {
        return
      }
      if (pathname.startsWith(item.link)) {
        item.selected = true
        isSelected = true
      }
    }
  })
  return isSelected
}

export default function Header(props: HeaderProps) {
  const { width } = props
  const { t } = useTranslation()

  const [icons, setIcons] = useState<boolean>(false)
  const isMobile = useMedia('(max-width: 960px)')
  const { chain } = useChainState()

  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    if (width && width > MEDIA_WIDTHS.upToMedium) {
      setIcons(true)
    } else {
      setIcons(false)
    }
  }, [width])

  const navItems: NavItemDefs[] = [
    {
      text: 'DPOs',
      link: '/dpos',
      iconLink: DpoIcon,
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
          link: '/assets/travelcabin',
          iconLink: BulletTrainIcon,
          internal: true,
        },
      ],
    },
    // {
    //   text: 'Bridge',
    //   link: '/bridge',
    //   iconLink: BridgeIcon,
    //   internal: true,
    // },
    {
      text: 'Faucet',
      link: '/faucet',
      iconLink: BridgeIcon,
      internal: true,
    },
    {
      text: 'DEX',
      link: '/dex',
      iconLink: DexIcon,
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
      link: chain ? (chain.url ? chain.url : '') : '',
      iconLink: ExplorerIcon,
      internal: false,
    },
    {
      text: 'Info',
      link: '',
      iconLink: InfoIcon,
      internal: true,
      children: [
        {
          text: 'FAQ',
          link: '/faq',
          iconLink: FaqIcon,
          internal: true,
        },
      ],
    },
  ]

  SelectNavItem(pathname, navItems)

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title to={{ pathname: '/' }}>
          <SpannerIcon>
            <img width={'40px'} src={(width as number) <= MEDIA_WIDTHS.upToMedium ? Logo : Logo} alt="logo" />
          </SpannerIcon>
          <LogoText>{t(`Spanner Protocol`)}</LogoText>
        </Title>
        <>{isMobile ? <MobileNav navItems={navItems} /> : <DesktopNav icons={icons} navItems={navItems} />}</>
      </HeaderRow>
    </HeaderFrame>
  )
}

interface DesktopNavProp {
  icons?: boolean
  navItems: NavItemDefs[]
}

const useStyles = makeStyles({
  drawer: {
    width: '210px',
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

const DesktopHeaderWrpper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

export function DesktopNav(props: DesktopNavProp) {
  const { chain } = useChainState()
  // let icons = props.icons
  const { t } = useTranslation()
  const classes = useStyles()
  const { navItems } = props

  return (
    <HeaderLinks style={{ flex: 1 }}>
      <DesktopHeaderWrpper>
        <div style={{ overflow: 'auto', flex: 1, width: '100%' }}>
          <Divider />
          {navItems.map(function (navItem, index) {
            if (chain && chain.chain !== 'Spanner' && navItem.text === 'Bridge') {
              return null
            } else if (chain && chain.chain !== 'Hammer' && navItem.text === 'Faucet') {
              return null
            } else {
              return (
                <NavItem
                  key={index}
                  iconLink={navItem.iconLink}
                  link={navItem.link}
                  text={t(navItem.text)}
                  internal={navItem.internal}
                  nested={false}
                  selected={navItem.selected ? navItem.selected : false}
                  classes={classes}
                  subs={navItem.children ? navItem.children : undefined}
                  toggleDrawer={undefined}
                />
              )
            }
          })}
        </div>
        <MenuBottom>
          <Divider />
          <HeaderElementWrap>
            <Transfer />
            <LanguageSwitch />
          </HeaderElementWrap>
          {/*<div style={{ padding: '1rem 0rem 1rem 0rem' }}>*/}
          {/*  <NetworkSelector />*/}
          {/*</div>*/}
        </MenuBottom>
      </DesktopHeaderWrpper>
    </HeaderLinks>
  )
}

const HamburgerWrapper = styled.div`
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

interface NavItemDefs {
  iconLink: string
  text: string
  link: string
  internal: boolean
  children?: NavItemDefs[]
  enable?: boolean
  selected?: boolean
}

interface NavItemProps {
  iconLink: string
  text: string
  link: string
  internal: boolean
  nested: boolean
  selected: boolean
  subs?: NavItemDefs[]
  classes: ClassNameMap<'list' | 'fullList' | 'nested'>
  toggleDrawer?: (open: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => void
}

function NavItem({ iconLink, text, link, classes, internal, nested, selected, subs, toggleDrawer }: NavItemProps) {
  return (
    <>
      <div
        className={clsx(classes.list, {
          [classes.fullList]: false,
        })}
        role="presentation"
        onClick={subs ? undefined : toggleDrawer ? toggleDrawer(false) : undefined}
        onKeyDown={subs ? undefined : toggleDrawer ? toggleDrawer(false) : undefined}
      >
        {internal ? (
          <List>
            {subs ? (
              <NavItemContent
                iconLink={iconLink}
                text={text}
                link={link}
                internal={internal}
                nested={nested}
                selected={selected}
                classes={classes}
                subs={subs}
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
                  selected={selected}
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
                  <ListItemIcon style={{ minWidth: '35px' }}>
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

export function NavItemContent({ iconLink, text, classes, nested, selected, subs, toggleDrawer }: NavItemProps) {
  const [open, setOpen] = React.useState(false)

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen)
  }
  const { t } = useTranslation()

  useEffect(() => {
    if (subs && selected) {
      setOpen(true)
    }
  }, [subs, selected])

  const itemSelected = subs === undefined && selected
  return (
    <>
      <ListItem button onClick={handleClick} selected={itemSelected} className={nested ? classes.nested : ''}>
        {iconLink && (
          <ListItemIcon style={{ minWidth: '35px' }}>
            <img width={'18px'} style={{ marginRight: '0.5rem' }} src={iconLink} alt={text} />
          </ListItemIcon>
        )}
        <ListItemText primary={text} />
        {subs != null ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItem>
      {subs && (
        <Collapse component="li" in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {subs.map(function (navItem, index) {
              return (
                <NavItem
                  key={index}
                  iconLink={navItem.iconLink}
                  link={navItem.link}
                  text={t(navItem.text)}
                  internal={navItem.internal}
                  nested={true}
                  selected={navItem.selected ? navItem.selected : false}
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

export function MobileNav({ navItems }: { navItems: NavItemDefs[] }) {
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
  const { account } = useActiveWeb3React()

  return (
    <HeaderLinks>
      <>
        <HeaderElement style={{ paddingRight: '0.5rem' }}>
          <Link to="/account/balances" style={{ textDecoration: 'none' }}>
            <BalanceWrapper>
              <BOLTAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                <User />
              </BOLTAmount>
            </BalanceWrapper>
          </Link>
          <Web3Status />
        </HeaderElement>
        <HamburgerWrapper onClick={toggleDrawer(true)}>
          <img src={HamburgerIcon} width="30px" alt="hamburgerIcon" />
        </HamburgerWrapper>
        <Drawer
          classes={{
            paper: classes.drawer,
          }}
          anchor={'right'}
          open={isOpen}
          onClose={toggleDrawer(false)}
          disableEnforceFocus
        >
          <div style={{ overflow: 'auto' }}>
            <Divider />
            {navItems.map(function (navItem, index) {
              if (chain && chain.chain !== 'Spanner' && navItem.text === 'Bridge') {
                return null
              } else if (chain && chain.chain !== 'Hammer' && navItem.text === 'Faucet') {
                return null
              } else {
                return (
                  <NavItem
                    key={index}
                    iconLink={navItem.iconLink}
                    link={navItem.link}
                    text={t(navItem.text)}
                    internal={navItem.internal}
                    nested={false}
                    selected={navItem.selected ? navItem.selected : false}
                    classes={classes}
                    subs={navItem.children ? navItem.children : undefined}
                    toggleDrawer={toggleDrawer}
                  />
                )
              }
            })}
          </div>
          <MenuBottom>
            <Divider />
            <HeaderElementWrap>
              <Transfer />
              <LanguageSwitch />
            </HeaderElementWrap>
            {/*<div style={{ padding: '1rem 0rem 1rem 0rem' }}>*/}
            {/*  <NetworkSelector />*/}
            {/*</div>*/}
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

export function Controls() {
  const { account } = useActiveWeb3React()

  return (
    <>
      <HeaderControls>
        <HeaderElement>
          <Web3Status />
          <Link to="/account/balances" style={{ textDecoration: 'none' }}>
            <BalanceWrapper>
              <Badge
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                color="secondary"
                badgeContent={0}
                showZero
              >
                <BOLTAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                  <User />
                </BOLTAmount>
              </Badge>
            </BalanceWrapper>
          </Link>
        </HeaderElement>
      </HeaderControls>
    </>
  )
}
