import styled from 'styled-components'

const Divider = styled.div<{ size?: string; borderStyle?: string; borderColor?: string; margin?: string }>`
  width: 100%;
  border-bottom: ${({ size }) => (size ? size : '1px')} ${({ borderStyle }) => (borderStyle ? borderStyle : 'solid')}
    ${({ borderColor, theme }) => (borderColor ? borderColor : theme.gray2)};
  margin: ${({ margin }) => (margin ? margin : '0')};
`

export default Divider
