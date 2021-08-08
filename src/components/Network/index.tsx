import { StyledExternalLink } from 'components/Link'
import StandardModal from 'components/Modal/StandardModal'
import { RowBetween, RowFixed } from 'components/Row'
import { SText } from 'components/Text'
import { BorderedWrapper, ContentWrapper } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import React, { useMemo, useState } from 'react'
import { Activity, ChevronDown, Circle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import useTheme from 'utils/useTheme'
import { DAPP_CHAIN, HAMMER_DAPP_URL, SPANNER_DAPP_URL, SPANNER_SUPPORTED_CHAINS } from '../../constants'

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
  margin: ${({ margin }) => (margin ? margin : 'auto')};
  border-radius: 15px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  width: ${({ width }) => (width ? width : 'fit-content')};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
`

const Option = styled(BorderedWrapper)`
  display: flex;
  justify-content: center;
  padding: 1rem;
  margin: 1rem 0;
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  ${({ padding, theme }) => theme.mediaWidth.upToSmall`
  padding: ${padding ? padding : '1rem'};
`};
`

interface FilterOption {
  icon?: JSX.Element
  href?: string
  label: string
  callback: Dispatcher<any>
}

function Options({
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
        <div key={index}>
          {activeOption !== option.label ? (
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
              <StyledExternalLink href={option.href ? option.href : ''}>
                <RowFixed>
                  <Activity size={12} color={activeOption === option.label ? theme.white : theme.text2} />
                  <SText color={activeOption === option.label ? theme.white : theme.text2} padding="0 1rem">
                    {t(option.label)}
                  </SText>
                </RowFixed>
              </StyledExternalLink>
            </Option>
          ) : (
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
              <RowFixed width="auto">
                <Activity size={12} color={activeOption === option.label ? theme.white : theme.text2} />
                <SText color={activeOption === option.label ? theme.white : theme.text2} padding="0 1rem">
                  {t(option.label)}
                </SText>
              </RowFixed>
            </Option>
          )}
        </div>
      ))}
    </>
  )
}

export default function NetworkSelector() {
  const chainOptions = SPANNER_SUPPORTED_CHAINS
  const { lastState } = useApi()
  // const { chain } = useChainState()
  // const [active, setActive] = useState<string>(chain ? chain.chainName : 'Spanner Mainnet')
  const theme = useTheme()
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const networkOptions = useMemo(() => {
    const options = chainOptions.map((chainOption) => ({
      label: chainOption.chain,
      href: chainOption.chain === 'Spanner Mainnet' ? SPANNER_DAPP_URL : HAMMER_DAPP_URL,
      callback: () => undefined,
      // callback: () => {
      //   setActive(chainOption.chain)
      // },
    }))
    return options
  }, [chainOptions])

  const dismissModal = () => {
    setModalOpen(false)
  }

  let color = theme.gray1
  if (lastState === 'error') {
    color = theme.red1
  } else if (lastState === 'disconnected') {
    color = theme.yellow1
  } else if (lastState === 'connected') {
    color = theme.gray1
  } else if (lastState === 'ready') {
    color = theme.green1
  }

  const active = DAPP_CHAIN === 'Spanner' ? 'Spanner Mainnet' : 'Hammer Testnet'

  return (
    <>
      <ContentWrapper>
        <StandardModal title={t(`Connect to Chain`)} isOpen={modalOpen} onDismiss={dismissModal} desktopScroll={true}>
          <Options options={networkOptions} activeOption={active} dismissModal={dismissModal} />
        </StandardModal>
        <SelectorWrapper onClick={() => setModalOpen(!modalOpen)} background={theme.white} borderColor={'transparent'}>
          <RowBetween margin="0">
            <RowFixed>
              <Circle size={10} color={color} fill={color} />
              <SText padding="0 0.5rem" width="100%" textAlign="center" color={theme.text2} fontWeight="700">
                {t(active)}
              </SText>
            </RowFixed>
            <ChevronDown size={12} color={theme.text2} />
          </RowBetween>
        </SelectorWrapper>
      </ContentWrapper>
    </>
  )
}
