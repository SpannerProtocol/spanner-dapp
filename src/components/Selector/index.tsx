import StandardModal from 'components/Modal/StandardModal'
import { SText } from 'components/Text'
import { BorderedWrapper } from 'components/Wrapper'
import React, { useEffect, useState } from 'react'
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

const OptionWrapper = styled(BorderedWrapper)`
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
`

const ActiveIcon = styled.div<{ selectedIconMaxWidth?: string; selectedIconMaxWidthMobile?: string }>`
  display: flex;
  max-width: ${({ selectedIconMaxWidth }) => (selectedIconMaxWidth ? selectedIconMaxWidth : '40px')};
  align-items: center;
  ${({ selectedIconMaxWidthMobile, theme }) => theme.mediaWidth.upToExtraSmall`
  max-width: ${selectedIconMaxWidthMobile ? selectedIconMaxWidthMobile : '55px'};
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
  backgroundColor?: string
  selectedIconMaxWidth?: string
  selectedIconMaxWidthMobile?: string
}

interface SelectOptionsProps {
  activeOption: SelectorOption
  options: Array<SelectorOption>
  handleSelect: (selected: SelectorOption) => void
}

function SelectorOptions(props: SelectOptionsProps) {
  const { activeOption, options, handleSelect } = props
  return (
    <>
      <div>
        {options.map((option, index) => (
          <SelectorWrapper key={index} onClick={() => handleSelect(option)}>
            <OptionWrapper
              style={{ margin: '0' }}
              borderColor={activeOption.label === option.label ? '#FFBE2E' : 'transparent'}
            >
              {option.icon ? (
                <>
                  <div style={{ display: 'flex', maxWidth: '25px', alignItems: 'center' }}>
                    <img
                      src={require(`assets/tokens/${option.icon}`)}
                      alt={'token icon'}
                      style={{ display: 'block', width: '100%' }}
                    />
                  </div>
                  <SText style={{ paddingLeft: '1rem' }}>{option.label}</SText>
                </>
              ) : (
                <SText>{option.label}</SText>
              )}
            </OptionWrapper>
          </SelectorWrapper>
        ))}
      </div>
    </>
  )
}

export default function Selector(props: SelectorProps) {
  const {
    title,
    defaultOption,
    options,
    collaspedTextPrefix,
    color,
    backgroundColor,
    selectedIconMaxWidth,
    selectedIconMaxWidthMobile,
  } = props
  const [activeOption, setActiveOption] = useState<SelectorOption>()
  const [selectModalOpen, setSelectModalOpen] = useState<boolean>(false)

  const handleSelect = (selected: SelectorOption) => {
    setSelectModalOpen(false)
    setActiveOption(selected)
    selected.callback && selected.callback()
  }
  const dismissModal = () => {
    setSelectModalOpen(false)
  }

  useEffect(() => {
    if (options.length <= 0) return
    if (activeOption) return
    const defaultSelectOption = options.find((option) => option.label === defaultOption.label)
    setActiveOption(defaultSelectOption)
  }, [activeOption, defaultOption, options])

  return (
    <>
      {activeOption && (
        <StandardModal title={title} isOpen={selectModalOpen} onDismiss={dismissModal} desktopScroll={true}>
          <SelectorOptions handleSelect={handleSelect} options={options} activeOption={activeOption} />
        </StandardModal>
      )}
      <SelectorWrapper background={backgroundColor} onClick={() => setSelectModalOpen(true)}>
        {activeOption && (
          <div style={{ display: 'inline-flex' }}>
            {activeOption.icon && (
              <ActiveIcon
                selectedIconMaxWidth={selectedIconMaxWidth}
                selectedIconMaxWidthMobile={selectedIconMaxWidthMobile}
              >
                <img
                  src={require(`assets/tokens/${activeOption.icon}`)}
                  style={{ display: 'block', width: '100%' }}
                  alt={'token icon'}
                />
              </ActiveIcon>
            )}
            <SText
              fontWeight={'700'}
              color={color}
              style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.5rem', wordBreak: 'initial' }}
            >
              {collaspedTextPrefix} {activeOption.label}
            </SText>
          </div>
        )}
      </SelectorWrapper>
    </>
  )
}
