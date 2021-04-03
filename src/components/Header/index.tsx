import NetworkSelector from 'components/Network'
import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import styled from 'styled-components'
import LaunchpadIcon from '../../assets/svg/icon-launchpad-white.svg'
import SwapIcon from '../../assets/svg/icon-swap-arrows-white.svg'
// import BlockIcon from '../../assets/svg/icon-block-white.svg'
import TrainIcon from '../../assets/svg/icon-train-white.svg'
import Logo from '../../assets/svg/logo-spanner-white.svg'
import { useActiveWeb3React } from '../../hooks'
import { MEDIA_WIDTHS, TYPE } from '../../theme'
import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Settings from '../Settings'
import Web3Status from '../Web3Status/Web3Substrate'

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
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.primary1} -11.67%,
    ${({ theme }) => theme.secondary1} 100%
  );
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    align-items: center;
    position: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.primary1} -11.67%, ${({ theme }) =>
    theme.secondary1} 100%);
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

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

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
  color: #fff;
  font-size: 16px;
  width: fit-content;
  margin: 1.1rem 1rem 1.1rem 1rem;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.white};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.white)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    color: ${({ theme }) => theme.white}
    font-size: 14px;
    padding: 0;
    justify-content: flex-end;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
`};
`

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName,
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: #fff;
//   font-size: 16px;
//   width: fit-content;
//   margin: 1.1rem 1rem 1.1rem 1rem;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 12px;
//     font-weight: 600;
//     color: ${({ theme }) => theme.primary2};
//   }

//   :hover,
//   :focus {
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToMedium`
//   display: flex;
//   color: ${({ theme }) => theme.text1}
//   font-size: 14px;
//   padding: 0;
//   justify-content: flex-end;
//   margin-left: 0.5rem;
//   margin-right: 0.5rem;
//   `};

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
//   `}
// `

const LogoText = styled.div`
  color: #fff;
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
        <HeaderLinks>
          {/* <StyledNavLink id={`account-nav-link`} to={'/account'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={AccountIcon} alt="account nav icon" />}
            Account
          </StyledNavLink> */}
          <StyledNavLink id={`dex-nav-link`} to={'/dex'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={SwapIcon} alt="dex" />}
            {t(`DEX`)}
          </StyledNavLink>
          <StyledNavLink id={`launchpad-nav-link`} to={'/launchpad'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={LaunchpadIcon} alt="launchpad" />}
            {t(`Launchpad`)}
          </StyledNavLink>
          <StyledNavLink id={`catalogue-nav-link`} to={'/catalogue'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={TrainIcon} alt="catalogue" />}
            {t(`BulletTrain`)}
          </StyledNavLink>
          {process.env.REACT_APP_DEBUG_MODE === 'true' && (
            <StyledNavLink id={`diagnostics-nav-link`} to={'/diagnostics'}>
              {`Diagnostics`}
            </StyledNavLink>
          )}
          {/* <StyledExternalLink id={`scan-nav-link`} href={'https://polkascan.io'}>
            {icons && <img width={'18px'} style={{ marginRight: '0.5rem' }} src={BlockIcon} alt="explorer" />}
            {t(`Explorer`)} <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink> */}
        </HeaderLinks>
      </HeaderRow>
    </HeaderFrame>
  )
}

export function Controls() {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  // const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    <>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {/* {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )} */}
          </HideSmall>
          {true && (
            <Link to="/account" style={{ textDecoration: 'none' }}>
              <BalanceWrapper>
                <BOLTAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                  {account && (
                    <HideSmall>
                      <TYPE.white
                        style={{
                          paddingRight: '.4rem',
                        }}
                      ></TYPE.white>
                    </HideSmall>
                  )}
                  {t(`Account`)}
                </BOLTAmount>
              </BalanceWrapper>
            </Link>
          )}
          <Web3Status />
        </HeaderElement>
        <HeaderElementWrap>
          <Settings />
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </>
  )
}
