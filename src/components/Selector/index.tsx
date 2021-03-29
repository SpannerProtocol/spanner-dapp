import StandardModal from 'components/Modal/StandardModal'
import { StandardText } from 'components/Text'
import { BorderedWrapper } from 'components/Wrapper'
import React, { useState } from 'react'
import styled from 'styled-components'

const SelectorWrapper = styled.div<{ background?: string; padding?: string }>`
  padding: ${({ padding }) => (padding ? padding : '0.5rem')};
  background: ${({ background }) => (background ? background : 'transparent')}
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  ${({ padding, theme }) => theme.mediaWidth.upToMedium`
  padding: ${padding ? padding : '0.5rem'};
  `};
`

export interface SelectorOption {
  label: string
  icon?: string
  callback?: () => void
}

interface SelectorProps {
  title: string
  collaspedTextPrefix?: string
  defaultOption: SelectorOption
  options: Array<SelectorOption>
  color?: string
}

interface SelectOptionsProps {
  options: Array<SelectorOption>
  handleSelect: (selected: SelectorOption) => void
}

function SelectorOptions(props: SelectOptionsProps) {
  const { options, handleSelect } = props
  return (
    <>
      <div>
        {options.map((option, index) => (
          <SelectorWrapper key={index} onClick={() => handleSelect(option)}>
            <BorderedWrapper style={{ margin: '0' }}>
              <div>{option.icon}</div>
              <StandardText>{option.label}</StandardText>
            </BorderedWrapper>
          </SelectorWrapper>
        ))}
      </div>
    </>
  )
}

export default function Selector(props: SelectorProps) {
  const { title, defaultOption, options, collaspedTextPrefix, color } = props
  const [activeOption, setActiveOption] = useState<SelectorOption>(defaultOption)
  const [selectModalOpen, setSelectModalOpen] = useState<boolean>(false)

  const handleSelect = (selected: SelectorOption) => {
    setSelectModalOpen(false)
    setActiveOption(selected)
    selected.callback && selected.callback()
  }
  const dismissModal = () => {
    setSelectModalOpen(false)
  }

  return (
    <>
      <StandardModal title={title} isOpen={selectModalOpen} onDismiss={dismissModal} desktopScroll={true}>
        <SelectorOptions handleSelect={handleSelect} options={options} />
      </StandardModal>
      <SelectorWrapper onClick={() => setSelectModalOpen(true)}>
        <StandardText fontWeight={'700'} color={color}>
          {collaspedTextPrefix} {activeOption.icon} {activeOption.label}
        </StandardText>
      </SelectorWrapper>
    </>
  )
}
