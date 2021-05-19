import StandardModal from 'components/Modal/StandardModal'
import { BorderedWrapper } from 'components/Wrapper'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import { ChevronDown } from 'react-feather'
import { StandardText } from 'components/Text'

const SelectorWrapper = styled.div<{ background?: string; padding?: string; borderColor?: string }>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
  background: ${({ background }) => (background ? background : 'transparent')}
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : '#e6ebf2')} !important;
  border-radius: 8px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  width: fit-content;
  ${({ padding, theme }) => theme.mediaWidth.upToMedium`
  padding: ${padding ? padding : '0.5rem'};
  `};
`

const Option = styled(BorderedWrapper)`
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
`

interface FilterOption {
  label: string
  callback: Dispatcher<any>
}

interface FilterProps {
  activeOption: string
  options: FilterOption[]
  modalTitle: string
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
            style={{ margin: '0' }}
            borderColor={activeOption === option.label ? '#FFBE2E' : 'transparent'}
          >
            {option.label}
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
export default function Filter({ options, activeOption, modalTitle }: FilterProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const dismissModal = () => {
    setModalOpen(false)
  }

  return (
    <div>
      {activeOption && (
        <StandardModal title={modalTitle} isOpen={modalOpen} onDismiss={dismissModal} desktopScroll={true}>
          <FilterOptions options={options} activeOption={activeOption} dismissModal={dismissModal} />
        </StandardModal>
      )}
      <SelectorWrapper onClick={() => setModalOpen(!modalOpen)}>
        <StandardText>
          {activeOption} <ChevronDown size={12} />
        </StandardText>
      </SelectorWrapper>
    </div>
  )
}
