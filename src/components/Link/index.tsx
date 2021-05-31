import { Link } from 'react-router-dom'
import { ExternalLink } from 'theme'
import styled from 'styled-components'
import { darken } from 'polished'

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

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.blue2)};
  }
`

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

export const SLink = styled(Link)<{
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
`
