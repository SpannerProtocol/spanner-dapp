import styled from 'styled-components'

const Divider = styled.div<{ size?: string; borderStyle?: string; borderColor?: string }>`
  width: 100%;
  border-bottom: ${({ size }) => (size ? size : '1px')} ${({ borderStyle }) => (borderStyle ? borderStyle : 'solid')}
    ${({ borderColor, theme }) => (borderColor ? borderColor : theme.gray2)};
`

export default Divider
