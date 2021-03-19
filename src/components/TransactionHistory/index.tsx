import { FlatCardPlate } from 'components/Card'
import { Heading, SmallText, StandardText } from 'components/Text'
import { Section, SpacedSection, Wrapper } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import truncateString from 'utils/truncateString'

const TxRow = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  // grid-template-areas: 'hash info';
  grid-column-gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: none;
    grid-template-rows: auto auto;
    grid-row-gap: 8px;
    grid-column-gap: 0px;
    // grid-template-areas:
    //   'hash'
    //   'info';
`};
`

const TxCell = styled.div`
  display: block;
  padding: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
`};
`

interface TransactionRowProps {
  hash: string
  module: string
  method: string
}

// Tx Hash | Extrinsic Info
function TransactionRow({ hash, module, method }: TransactionRowProps) {
  return (
    <TxRow>
      <TxCell>
        <StandardText>{truncateString(hash)}</StandardText>
        <SmallText>
          {module}
          {method}
        </SmallText>
      </TxCell>
      <TxCell></TxCell>
    </TxRow>
  )
}

export default function TransactionHistory() {
  const { t } = useTranslation()
  return (
    <>
      <Wrapper
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlatCardPlate>
          <Section style={{ marginBottom: '1rem', padding: '1rem' }}>
            <Heading>{t(`Transaction History`)}</Heading>
          </Section>
          <SpacedSection>
            <TransactionRow hash={''} module={''} method={''}></TransactionRow>
          </SpacedSection>
        </FlatCardPlate>
      </Wrapper>
    </>
  )
}
