import styled from 'styled-components'

export const TokenInputAmount = styled.input`
  border: transparent;
  border-radius: 8px 0px 0px 8px;
  display: block;
  padding: 0.75rem;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.5;
  color: #575757;
  border-right: 1px solid #e6ebf2;
  background-clip: padding-box;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
  outline: none;
  -webkit-box-align: stretch;
`

export const TokenInputWrapper = styled.div`
  display: flex;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
`

export const InputGroup = styled.div`
  display: block;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  width: 100%;
`

export const ConsoleStat = styled.span`
  text-align: right;
  color: #000;
`

export const InputHeader = styled.div`
  display: flex;
  justify-content: space-between !important;
`

export const LightHeader = styled.div`
  color: #9a99a2;
`

export const HeavyHeader = styled.div`
  color: #9a99a2;
  font-weight: 700;
`

export const ErrorMsg = styled.div`
  display: block;
  color: #ff9494;
  font-size: 0.8rem;
`

export const PendingMsg = styled.span`
  color: ${({ theme }) => theme.primary1};
  font-size: 0.8rem;
`
