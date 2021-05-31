import styled from 'styled-components'

export const Pill = styled.div<{
  borderColor?: string
  background?: string
  padding?: string
  marginTop?: string
  marginBottom?: string
}>`
  margin-top: ${({ marginTop }) => (marginTop ? marginTop : '1rem')};
  margin-bottom: ${({ marginBottom }) => (marginBottom ? marginBottom : '1rem')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  background: ${({ background }) => (background ? background : 'transparent')};
  padding: ${({ padding }) => (padding ? padding : '0.35rem 1rem')};
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')};
  border-radius: 18px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  display: block;
  align-items: center;
  overflow-wrap: anywhere;
`
