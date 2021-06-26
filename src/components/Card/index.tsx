import React from 'react'
import styled from 'styled-components'
import { CardProps, Text } from 'rebass'
import { Box } from 'rebass/styled-components'

const Card = styled(Box)<{
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
  maxWidth?: string
  height?: string
  margin?: string
  minHeight?: string
  mobileMinHeight?: string
}>`
  box-shadow: 0px 8px 15px #2b2f4a19;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.white};
  width: ${({ width }) => (width ? width : '100%')};
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  border: ${({ border }) => (border ? border : '1px solid transparent')};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '10px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '100%')};
  min-height: ${({ minHeight }) => (minHeight ? minHeight : 'auto')};
  ${({ mobileMinHeight, theme }) => theme.mediaWidth.upToExtraSmall`
  min-height: ${mobileMinHeight ? mobileMinHeight : 'auto'};
  `};
`

export default Card

// Normal Card with surrounding shadows
export const FlatCard = styled(Card)<{
  margin?: string
  padding?: string
  width?: string
  minHeight?: string
  mobileMinHeight?: string
}>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  margin: ${({ margin }) => (margin ? margin : '0 0 1rem')};
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  width: ${({ width }) => (width ? width : '100%')};
  min-height: ${({ minHeight }) => (minHeight ? minHeight : 'auto')};
  ${({ theme, padding, margin }) => theme.mediaWidth.upToSmall`
    margin: ${margin ? margin : '0 0 0.5rem'};
    padding: ${padding ? padding : '0.5rem'};
`};
  ${({ theme, mobileMinHeight }) => theme.mediaWidth.upToExtraSmall`
  min-height: ${mobileMinHeight ? mobileMinHeight : '70px'};
`};
`

// Normal Card with surrounding shadows
export const ThinShadowCard = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  background: ${({ background }) => (background ? background : '#fff')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow2};
  font-weight: 500;
`

const BlueCardStyled = styled(Card)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primary1};
  border-radius: 12px;
  width: fit-content;
`

export const BlueCard = ({ children, ...rest }: CardProps) => {
  return (
    <BlueCardStyled {...rest}>
      <Text fontWeight={500} color="#2172E5">
        {children}
      </Text>
    </BlueCardStyled>
  )
}

export const CardIconGrid = styled(Card)<{ columns?: string }>`
  display: grid;
  padding: 0;
  width: 100%;
  grid-template-columns: min(110px) auto min(110px);
  grid-column-gap: 0.5rem;
  grid-row-gap: 0.5rem;
  height: 110px;
  margin-top: 1rem;
  margin-bottom: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  grid-template-columns: min(80px) auto min(80px);
  grid-column-gap: 0.35rem;
  grid-row-gap: 0.35rem;
  height: 140px;
  `};
`

export const SecondaryGradientCard = styled(Card)`
  background: transparent linear-gradient(180deg, #3f4564 0%, #262a41 100%) 0% 0% no-repeat padding-box;
  opacity: 1;
`

export const BannerCard = styled(Card)<{ url?: string; backgroundSize?: string; darkenBackground?: boolean }>`
  background: ${({ darkenBackground }) =>
      darkenBackground && `linear-gradient( rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) ),`}
    ${({ url }) => (url ? `url(${url}) no-repeat center center` : `#fff`)};
  background-size: ${({ backgroundSize }) => (backgroundSize ? backgroundSize : 'cover')};
  box-shadow: none;
  border: ${({ border }) => (border ? border : 'none')};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '10px')};
`

export const BgColorCard = styled(Card)<{ backgroundColor?: string; border?: string; borderRadius?: string }>`
  background: ${({ backgroundColor, theme }) => (backgroundColor ? backgroundColor : theme.bg5)};
  box-shadow: none;
  border: ${({ border }) => (border ? border : 'none')};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '10px')};
`

export const DetailGridCard = styled(Card)`
  display: grid;
  padding: 0;
  margin: 0;
  box-shadow: none;
  border: 0;
  background: transparent;
  grid-template-columns: auto max(20px);
  width: 100%;
`
