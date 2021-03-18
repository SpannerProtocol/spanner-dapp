import styled from 'styled-components'
import { BorderedInput } from '../../../components/Input'

export const TokenInputAmount = styled(BorderedInput)`
  border-right: 0px !important;
  border-radius: 8px 0 0 8px;
`

export const TokenInputWrapper = styled.div`
  display: flex;
  webkit-box-align: stretch;
  box-align: stretch;
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

export const ErrorMsg = styled.span`
  color: #ff9494;
  font-size: 0.8rem;
`

export const PendingMsg = styled.span`
  color: ${({ theme }) => theme.primary1};
  font-size: 0.8rem;
`