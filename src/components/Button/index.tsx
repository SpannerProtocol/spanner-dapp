import styled from 'styled-components'
import { darken } from 'polished'

import { Button as RebassButton } from 'rebass/styled-components'

const Base = styled(RebassButton)<{
  color?: string
  padding?: string
  margin?: string
  borderColor?: string
  borderRadius?: string
  altDisabledStyle?: boolean
  fontSize?: string
  minHeight?: string
  minWidth?: string
  maxWidth?: string
  mobileFontSize?: string
  mobilePadding?: string
  mobileMinHeight?: string
  mobileMinWidth?: string
  mobileMaxWidth?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  min-width: ${({ minWidth }) => (minWidth ? minWidth : '120px')};
  min-height: ${({ minHeight }) => (minHeight ? minHeight : '25px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '160px')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '16px')};
  font-weight: 700;
  text-align: center;
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '5px')};
  outline: none;
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')};
  color: ${({ color }) => (color ? color : '#fff')};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
  @media only screen and (max-width: 500px) {
    font-size: ${({ mobileFontSize }) => (mobileFontSize ? mobileFontSize : '12px')};
    padding: ${({ mobilePadding }) => (mobilePadding ? mobilePadding : '0.5rem')};
    min-width: ${({ mobileMinWidth }) => (mobileMinWidth ? mobileMinWidth : '100px')};
    min-height: ${({ mobileMinHeight }) => (mobileMinHeight ? mobileMinHeight : '25px')};
    max-width: ${({ mobileMaxWidth }) => (mobileMaxWidth ? mobileMaxWidth : '125px')};
  }
`

export const ButtonPrimary = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : theme.bg3)};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`

export const FakeButton = styled.div<{
  padding?: string
  width?: string
  borderRadius?: string
  altDisabledStyle?: boolean
  fontSize?: string
  color?: string
  margin?: string
  borderColor?: string
  minHeight?: string
  minWidth?: string
  maxWidth?: string
  mobileMargin?: string
  mobileFontSize?: string
  mobilePadding?: string
  mobileMinHeight?: string
  mobileMinWidth?: string
  mobileMaxWidth?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  width: ${({ width }) => (width ? width : '100%')};
  min-width: ${({ minWidth }) => (minWidth ? minWidth : '120px')};
  min-height: ${({ minHeight }) => (minHeight ? minHeight : '25px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '160px')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '16px')};
  font-weight: 900;
  text-align: center;
  border: 1px solid transparent;
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '8px')};
  background-color: ${({ theme }) => theme.primary1};
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : theme.bg3)};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
  @media only screen and (max-width: 500px) {
    font-size: ${({ mobileFontSize }) => (mobileFontSize ? mobileFontSize : '12px')};
    padding: ${({ mobilePadding }) => (mobilePadding ? mobilePadding : '0.5rem')};
    min-width: ${({ mobileMinWidth }) => (mobileMinWidth ? mobileMinWidth : '100px')};
    min-height: ${({ mobileMinHeight }) => (mobileMinHeight ? mobileMinHeight : '25px')};
    max-width: ${({ mobileMaxWidth }) => (mobileMaxWidth ? mobileMaxWidth : '125px')};
    margin: ${({ mobileMargin }) => (mobileMargin ? mobileMargin : '0')};
  }
`

export const ButtonSecondary = styled(ButtonPrimary)`
  background-color: ${({ theme }) => theme.secondary1};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.secondary1)};
    background-color: ${({ theme }) => darken(0.05, theme.secondary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.secondary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.secondary1)};
    background-color: ${({ theme }) => darken(0.1, theme.secondary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : theme.bg3)};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`

export const ButtonLight = styled(ButtonPrimary)`
  background-color: ${({ theme }) => darken(0.05, theme.white)};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  color: ${({ theme }) => theme.text1};
  border: 1px solid transparent;
`

export const ButtonTrans = styled(ButtonPrimary)`
  background-color: transparent;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.white};
  }
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : '#262a41')};
`

export const PillButton = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '15px')};
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : theme.bg3)};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`
