import styled from 'styled-components'

export const Icon = styled.img<{
  size?: string
  padding?: string
  margin?: string
  withBackground?: boolean
  backgroundColor?: string
  borderRadius?: string
}>`
  width: ${({ size }) => (size ? size : '24px')};
  height: ${({ size }) => (size ? size : '24px')};
  padding: ${({ padding }) => (padding ? padding : '0.3rem')};
  margin: ${({ margin }) => (margin ? margin : '0.1rem')};
  background: ${({ withBackground, backgroundColor, theme }) =>
    withBackground ? (backgroundColor ? backgroundColor : theme.gray3) : 'transparent'};
  border: ${({ withBackground }) => (withBackground ? `1px solid transparent` : 'none')};
  border-radius: ${({ withBackground, borderRadius }) =>
    withBackground ? (borderRadius ? borderRadius : '50%') : 'none'};
`
