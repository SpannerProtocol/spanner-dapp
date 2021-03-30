import Selector from 'components/Selector'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import useTokens from 'hooks/useTokens'

const TokenSelectorWrapper = styled.div<{ background?: string }>`
  background: ${({ background }) => (background ? background : 'transparent')};
  align-items: center;
  justify-content: center;
  display: flex;
  border-top: 1px solid #e6ebf2;
  border-bottom: 1px solid #e6ebf2 !important;
  border-right: 1px solid #e6ebf2 !important;
  border-left: 0px solid !important;
  border-left-width: 0px;
  border-radius: 0 8px 8px 0;
  padding: 0;
  width: fit-content;
  padding-left: 1rem;
  padding-right: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  `};
`

interface TokenSelectorProps {
  collaspedTextPrefix?: string
  defaultToken: string
  color?: string
  background?: string
  selectToken: (token: string) => void
}

export default function TokenSelector({
  collaspedTextPrefix,
  defaultToken,
  color,
  background,
  selectToken,
}: TokenSelectorProps) {
  const tokens = useTokens()

  const selectorOptions = useMemo(() => {
    const options = tokens.map((token) => ({
      label: token.name,
      icon: token.iconPath,
      callback: () => selectToken(token.name),
    }))
    return options
  }, [selectToken, tokens])

  return (
    <>
      <TokenSelectorWrapper background={background}>
        <Selector
          title={'Select Token'}
          options={selectorOptions}
          defaultOption={{ label: defaultToken }}
          collaspedTextPrefix={collaspedTextPrefix}
          color={color}
        />
      </TokenSelectorWrapper>
    </>
  )
}
