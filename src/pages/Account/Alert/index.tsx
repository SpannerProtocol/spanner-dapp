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
  width: ${({ width }) => (width ? width : 'auto')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '125px')};
  justify-content: flex-start;
  align-items: center;
  text-align: left;
`

export const AlertIcon = styled.img`
  height: 12px;
  :hover {
    cursor: pointer;
  }
`
