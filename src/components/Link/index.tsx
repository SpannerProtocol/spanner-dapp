import { Link } from 'react-router-dom'
import { ExternalLink } from 'theme'
import styled from 'styled-components'
import { darken } from 'polished'

export const StyledLink = styled(Link)<{ fontSize?: string; color?: string }>`
  text-decoration: none;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  color: ${({ color, theme }) => (color ? color : theme.blue2)};

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.blue2)};
  }
`

export const StyledExternalLink = styled(ExternalLink)<{ fontSize?: string; color?: string }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ color, theme }) => (color ? color : theme.blue2)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  width: fit-content;
  font-weight: 500;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.blue2)};
  }
`
