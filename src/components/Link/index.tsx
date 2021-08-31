import { darken } from 'polished'
import { useContext } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { HashLink, HashLinkProps } from 'react-router-hash-link'
import styled, { ThemeContext } from 'styled-components'
import { ExternalLink } from 'theme'

export const StyledExternalLink = styled(ExternalLink)<{
  fontWeight?: number
  color?: string
  fontSize?: string
  width?: string
  padding?: string
}>`
  ${({ theme }) => theme.flexRowNoWrap}
  text-decoration: none;
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 400)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  width: ${({ width }) => (width ? width : 'fit-content')};
  margin: 0;
  padding: ${({ padding }) => (padding ? padding : '0.1rem 0')};
  cursor: pointer;
  text-align: left;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.blue2)};
  }
`

export const StyledLink = styled(Link)<{
  fontWeight?: number
  color?: string
  fontSize?: string
  width?: string
  padding?: string
}>`
  text-decoration: none;
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 400)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  width: ${({ width }) => (width ? width : 'fit-content')};
  margin: 0;
  padding: ${({ padding }) => (padding ? padding : '0.1rem 0')};
  cursor: pointer;
  ${({ fontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${fontSize ? fontSize : '12px'};
`};
`

export const StyledHashLink = styled(HashLink)<{
  fontWeight?: number
  color?: string
  fontSize?: string
  width?: string
  padding?: string
  colorIsBlue?: boolean
}>`
  text-decoration: none;
  color: ${({ color, colorIsBlue, theme }) => (color ? color : colorIsBlue ? theme.blue2 : theme.text1)};
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 400)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  width: ${({ width }) => (width ? width : 'fit-content')};
  margin: 0;
  padding: ${({ padding }) => (padding ? padding : '0.1rem 0')};
  cursor: pointer;
  ${({ fontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${fontSize ? fontSize : '12px'};
`};
`

interface SLinkProps extends LinkProps {
  fontWeight?: number
  color?: string
  colorIsBlue?: boolean
  fontSize?: string
  width?: string
  padding?: string
  children: React.ReactNode
}

interface SHashLinkProps extends HashLinkProps {
  fontWeight?: number
  color?: string
  colorIsBlue?: boolean
  fontSize?: string
  width?: string
  padding?: string
  children: React.ReactNode
}

export function SLink(props: SLinkProps) {
  const { fontWeight, color, colorIsBlue, fontSize, width, padding, children, ...linkProps } = props
  const customProps = { fontWeight, color, fontSize, width, padding }
  const theme = useContext(ThemeContext)
  return (
    <StyledLink {...linkProps} {...customProps} color={color ? color : colorIsBlue ? theme.blue2 : theme.text1}>
      {children}
    </StyledLink>
  )
}

export function SHashLink(props: SHashLinkProps) {
  const { fontWeight, color, colorIsBlue, fontSize, width, padding, children, ...linkProps } = props
  const customProps = { fontWeight, color, fontSize, width, padding }
  const theme = useContext(ThemeContext)
  return (
    <StyledHashLink {...linkProps} {...customProps} color={color ? color : colorIsBlue ? theme.blue2 : theme.text1}>
      {children}
    </StyledHashLink>
  )
}
