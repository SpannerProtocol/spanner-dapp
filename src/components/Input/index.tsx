import styled from 'styled-components'

const InputBase = styled.input<{ fontSize?: string; padding?: string }>`
  border-radius: none;
  border: none;
  display: block;
  padding: ${({ padding }) => (padding ? padding : '0.75rem')};
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #575757;
  background-clip: padding-box;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
  outline: none;
  -webkit-box-align: stretch;

  ${({ fontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${fontSize ? fontSize : '12px'};
`};
`

export const BorderedInput = styled(InputBase)`
  border-radius: 8px;
  border: 1px solid #e6ebf2 !important;
`

export const SInput = styled(InputBase)`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
`
