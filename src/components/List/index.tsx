import styled from 'styled-components'

export const DocListItem = styled.div`
  line-height: 24px;
`

export const UnorderedList = styled.ul<{
  fontSize?: string
  mobileFontSize?: string
  color?: string
  width?: string
  padding?: string
  textAlign?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  width: ${({ width }) => (width ? width : '100%')};
  margin: 0;
  padding: ${({ padding }) => (padding ? padding : '0 0 0 2rem')};
  line-height: 1.5;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'left')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '12px'};
  `};
`

export const ListItem = styled.li`
  font-family: 'Lato', 'Roboto', 'sans-serif';
`
