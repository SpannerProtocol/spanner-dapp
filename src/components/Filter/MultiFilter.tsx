import StandardModal from 'components/Modal/StandardModal'
import { Pill } from 'components/Pill'
import { RowBetween, RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import { BorderedWrapper } from 'components/Wrapper'
import React, { useContext, useState } from 'react'
import { Check } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'
import { Dispatcher } from 'types/dispatcher'

const SelectorWrapper = styled.div<{ background?: string; padding?: string; margin?: string; borderColor?: string }>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
  background: ${({ background }) => (background ? background : 'transparent')};
  border-bottom: 1px solid ${({ borderColor, theme }) => (borderColor ? borderColor : theme.gray2)} !important;
  margin: ${({ margin }) => (margin ? margin : '0')};
  // border-radius: 8px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  width: 100%;
`

const Option = styled(BorderedWrapper)`
  display: flex;
  justify-content: center;
  text-align: left;
  margin: 0.25rem 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
`

interface FilterOption {
  label: string
  callback: Dispatcher<any>
  subElement?: JSX.Element
  subOnlyActive?: boolean
}

interface MultiFilterProps {
  activeOptions: string[]
  options: FilterOption[]
  modalTitle: string
}

function MultiFilterOptions({ options, activeOptions }: { options: FilterOption[]; activeOptions: string[] }) {
  const theme = useContext(ThemeContext)
  return (
    <>
      {options.map((option, index) => {
        const isActive = activeOptions.includes(option.label)
        return (
          <RowBetween key={index}>
            <Option
              onClick={() => option.callback(option.label)}
              borderColor={isActive ? 'transparent' : 'transparent'}
              background={isActive ? theme.primary1 : theme.gray3}
            >
              <RowBetween>
                <SText padding="0 1rem" color={isActive ? theme.white : theme.text1}>
                  {option.label}
                </SText>
                {isActive && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                    <Check size={12} color={theme.white} />
                  </div>
                )}
              </RowBetween>
            </Option>
            {option.subElement && (
              <>{option.subOnlyActive ? <>{isActive ? option.subElement : null}</> : <>{option.subElement}</>}</>
            )}
          </RowBetween>
        )
      })}
    </>
  )
}

export function MultiFilter({ options, activeOptions, modalTitle }: MultiFilterProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { t } = useTranslation()

  const dismissModal = () => {
    setModalOpen(false)
  }
  return (
    <>
      {activeOptions && (
        <StandardModal title={modalTitle} isOpen={modalOpen} onDismiss={dismissModal} desktopScroll={true}>
          <MultiFilterOptions options={options} activeOptions={activeOptions} />
        </StandardModal>
      )}
      <SelectorWrapper onClick={() => setModalOpen(!modalOpen)}>
        <SText fontSize="12px" mobileFontSize="9px">
          {t(`Sorted By`)}
        </SText>
        <RowFixed margin="0.25rem 0">
          {activeOptions.map((activeOption, index) => (
            <Pill key={index} margin="0 0.25rem" padding="0.25rem 1rem">
              {activeOption}
            </Pill>
          ))}
        </RowFixed>
      </SelectorWrapper>
    </>
  )
}
