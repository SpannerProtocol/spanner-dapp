import StandardModal from 'components/Modal/StandardModal'
import { BorderedWrapper } from 'components/Wrapper'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import { ChevronDown } from 'react-feather'
import { SText } from 'components/Text'
import { RowBetween, RowFixed } from 'components/Row'
import { useTranslation } from 'react-i18next'
import useTheme from 'utils/useTheme'

const SelectorWrapper = styled.div<{
  background?: string
  padding?: string
  margin?: string
  borderColor?: string
  color?: string
  width?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem 1rem')};
  background: ${({ background, theme }) => (background ? background : theme.secondary1)};
  color: ${({ color, theme }) => (color ? color : theme.white)};
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')} !important;
  margin: ${({ margin }) => (margin ? margin : '0')};
  border-radius: 8px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  width: ${({ width }) => (width ? width : 'fit-content')};
`

const Option = styled(BorderedWrapper)`
  display: flex;
  justify-content: center;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  ${({ padding, theme }) => theme.mediaWidth.upToSmall`
  padding: ${padding ? padding : '0.75rem'};
`};
`

interface FilterOption {
  icon?: JSX.Element
  label: string
  callback: Dispatcher<any>
}

interface FilterProps {
  activeOption: string
  options: FilterOption[]
  modalTitle: string
  color?: string
  background?: string
  padding?: string
  margin?: string
  width?: string
  borderColor?: string
  filterLabel?: string
}

function FilterOptions({
  options,
  activeOption,
  dismissModal,
}: {
  options: FilterOption[]
  activeOption: string
  dismissModal: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      {options.map((option, index) => (
        <>
          <Option
            key={index}
            onClick={() => {
              option.callback(option.label)
              dismissModal()
            }}
            color={activeOption === option.label ? theme.white : theme.text2}
            background={activeOption === option.label ? theme.primary1 : 'transparent'}
            borderColor={activeOption === option.label ? theme.primary1 : 'transparent'}
          >
            <RowFixed>
              {option.icon && <div style={{ padding: '0 0.5rem 0 0' }}>{option.icon}</div>}
              <SText color={activeOption === option.label ? theme.white : theme.text2} padding="0 1rem">
                {t(option.label)}
              </SText>
            </RowFixed>
          </Option>
        </>
      ))}
    </>
  )
}

/**
 * Filter takes an object with a label and a callback.
 * On selection of one of the labels, it will call the callback
 */
export default function Filter({
  options,
  activeOption,
  modalTitle,
  filterLabel,
  background,
  padding,
  margin,
  width,
  color,
  borderColor,
}: FilterProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { t } = useTranslation()

  const dismissModal = () => {
    setModalOpen(false)
  }

  return (
    <div style={{ display: 'block', margin: margin ? margin : '0.5rem' }}>
      {activeOption && (
        <StandardModal title={modalTitle} isOpen={modalOpen} onDismiss={dismissModal} desktopScroll={true}>
          <FilterOptions options={options} activeOption={activeOption} dismissModal={dismissModal} />
        </StandardModal>
      )}
      {filterLabel && (
        <SText fontSize="12px" mobileFontSize="9px" padding="0 0 0.25rem 0">
          {t(filterLabel)}
        </SText>
      )}
      <SelectorWrapper
        onClick={() => setModalOpen(!modalOpen)}
        background={background}
        padding={padding}
        color={color}
        width={width}
        borderColor={borderColor}
      >
        <RowBetween margin="0">
          <SText
            padding="0 0.25rem 0 0"
            width="100%"
            textAlign="center"
            color={color ? color : '#fff'}
            fontWeight="700"
          >
            {t(activeOption)}
          </SText>
          <ChevronDown size={12} />
        </RowBetween>
      </SelectorWrapper>
    </div>
  )
}
