import { SText } from 'components/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ToggleElement = styled.span<{
  padding?: string
  isActive?: boolean
  isOnSwitch?: boolean
  inActiveBg?: string
  inActiveColor?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem 0.8rem;')};
  border-radius: 12px;
  background: ${({ theme, isActive, isOnSwitch, inActiveBg }) =>
    isActive ? (isOnSwitch ? theme.primary1 : inActiveBg ? inActiveBg : theme.text4) : 'none'};
  color: ${({ theme, isActive, isOnSwitch, inActiveColor }) =>
    isActive ? (isOnSwitch ? theme.white : inActiveColor ? inActiveColor : theme.text2) : theme.text2};
  font-size: 0.7rem;
  font-weight: ${({ isOnSwitch }) => (isOnSwitch ? '500' : '400')};
  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
    background: ${({ theme, isActive, isOnSwitch, inActiveBg }) =>
      isActive ? (isOnSwitch ? theme.primary1 : inActiveBg ? inActiveBg : theme.text3) : 'none'};
    color: ${({ theme, isActive, isOnSwitch, inActiveColor }) =>
      isActive ? (isOnSwitch ? theme.white : inActiveColor ? inActiveColor : theme.text2) : theme.text3};
  }
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean; margin?: string }>`
  border-radius: 12px;
  border: none;
  /* border: 1px solid ${({ theme, isActive }) => (isActive ? theme.primary5 : theme.text4)}; */
  background: ${({ theme }) => theme.bg3};
  margin: ${({ margin }) => (margin ? margin : '0')};
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 0;
  /* background-color: transparent; */
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
  labelActive?: string
  labelInactive?: string
  toggleLabel?: string
  margin?: string
  centered?: boolean
  inActiveColor?: string
  inActiveBg?: string
  buttonPadding?: string
}

export default function PillToggleFilter({
  id,
  isActive,
  toggle,
  labelActive,
  labelInactive,
  margin,
  buttonPadding,
  centered,
  toggleLabel,
  inActiveColor,
  inActiveBg,
}: ToggleProps) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'block', margin: margin ? margin : '0.5rem' }}>
      {toggleLabel && (
        <SText fontSize="12px" mobileFontSize="9px" padding="0 0 0.25rem 0">
          {t(toggleLabel)}
        </SText>
      )}
      <StyledToggle id={id} isActive={isActive} onClick={toggle} margin={centered ? 'auto' : '0'}>
        <ToggleElement isActive={isActive} isOnSwitch={true} padding={buttonPadding}>
          {t(labelActive)}
        </ToggleElement>
        <ToggleElement
          isActive={!isActive}
          isOnSwitch={false}
          inActiveColor={inActiveColor}
          inActiveBg={inActiveBg}
          padding={buttonPadding}
        >
          {t(labelInactive)}
        </ToggleElement>
      </StyledToggle>
    </div>
  )
}
