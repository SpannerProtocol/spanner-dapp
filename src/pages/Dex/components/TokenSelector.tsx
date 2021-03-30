import Selector from 'components/Selector'
import React, { useMemo } from 'react'
import { BorderedWrapper } from 'components/Wrapper'
import styled from 'styled-components'
import useTokens from 'hooks/useTokens'

const TokenSelectorWrapper = styled(BorderedWrapper)`
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  borderTop: '1px solid #e6ebf2 !important',
  borderBottom: '1px solid #e6ebf2 !important',
  borderRight: '1px solid #e6ebf2 !important',
  borderLeft: '0px solid !important',
  borderLeftWidth: '0px',
  borderRadius: '0 8px 8px 0',
  padding: 0;
  width: 100%;
  max-width: 240px;
  margin-left: 1rem;
  // ${({ theme }) => theme.mediaWidth.upToMedium`
  //   padding: 0;
  //   margin-top: 0.25;
  //   margin-bottom: 0.25;
  //   max-width: fit-content;
  // `};
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
      callback: () => selectToken(token),
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
