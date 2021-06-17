import StandardModal from 'components/Modal/StandardModal'
import { Pill } from 'components/Pill'
import { RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import { BorderedWrapper, ContentWrapper } from 'components/Wrapper'
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
  margin: 0.25rem 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
`

interface FilterOption {
  label: string
  callback: Dispatcher<any>
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
      {options.map((option, index) => (
        <>
          <Option
            key={index}
            onClick={() => option.callback(option.label)}
            borderColor={activeOptions.includes(option.label) ? '#FFBE2E' : 'transparent'}
          >
            {option.label}
            {activeOptions.includes(option.label) && <Check size={12} color={theme.green1} />}
          </Option>
        </>
      ))}
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
    <ContentWrapper>
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
          {/* <ChevronDown size={12} /> */}
        </RowFixed>
      </SelectorWrapper>
    </ContentWrapper>
  )
}
