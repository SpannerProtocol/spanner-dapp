import styled from 'styled-components'

export const Pill = styled.div<{
  borderColor?: string
  background?: string
  padding?: string
  margin?: string
  fontWeight?: string
  fontSize?: string
  mobileFontSize?: string
}>`
  display: block;
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  margin: ${({ margin }) => (margin ? margin : '1rem')};
  color: ${({ color, theme }) => (color ? color : theme.white)};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '700')};
  background: ${({ background, theme }) => (background ? background : theme.primary1)};
  padding: ${({ padding }) => (padding ? padding : '0.35rem 1rem')};
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')};
  border-radius: 18px;
  width: fit-content;
  text-align: center;
  overflow-wrap: anywhere;
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '12px'};
  `};
`
