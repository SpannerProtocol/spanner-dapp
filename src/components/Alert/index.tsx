import styled from 'styled-components'

export const AlertWrapper = styled.div<{
  padding?: string
  width?: string
  maxWidth?: string
  borderRadius?: string
  altDisabledStyle?: boolean
  fontSize?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '14px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '125px')};
  justify-content: center;
  align-items: middle;
  text-align: center;
`

export const AlertIcon = styled.img`
  margin: 0.2rem;
  height: 15px;
  :hover {
    cursor: pointer;
  }
`
