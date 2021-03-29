import Selector from 'components/Selector'
import { SPANNER_SUPPORTED_CHAINS } from '../../constants'
import React, { useMemo } from 'react'
import { useApi } from 'hooks/useApi'
import { BorderedWrapper } from 'components/Wrapper'
import styled from 'styled-components'

const NetworkWrapper = styled(BorderedWrapper)`
  padding: 0;
  width: 100%;
  max-width: 240px;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
    margin-top: 0.25;
    margin-bottom: 0.25;
    max-width: fit-content;
  `};
`

interface NetworkSelectorProps {
  collaspedTextPrefix?: string
  color?: string
  background?: string
}

export default function NetworkSelector(props: NetworkSelectorProps) {
  const chainOptions = SPANNER_SUPPORTED_CHAINS
  const { connectToNetwork } = useApi()
  const selectorOptions = useMemo(() => {
    const options = chainOptions.map((chainOption) => ({
      label: chainOption.chain,
      callback: () => connectToNetwork(chainOption.chain),
    }))
    return options
  }, [chainOptions, connectToNetwork])
  return (
    <>
      <NetworkWrapper background={props.background}>
        <Selector
          title={'Select Network'}
          options={selectorOptions}
          defaultOption={selectorOptions[1]}
          collaspedTextPrefix={props.collaspedTextPrefix}
          color={props.color}
        />
      </NetworkWrapper>
    </>
  )
}
