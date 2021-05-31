import { FlatCard } from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import { HeavyText, SectionTitle, SText } from 'components/Text'
import { BalanceData, useAllBalances } from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import getProjectRegistry from '../../utils/getProjectRegistry'

interface BalanceDataProps {
  balances: Array<BalanceData> | undefined
  decimals: number
}

interface BalanceRowProps {
  icon: string
  token: string
  type: string
  balance: string
}

function structureBalanceData(data: BalanceDataProps) {
  const { balances, decimals } = data
  if (!balances) return
  const balanceRows = balances.map((balance) => {
    const projectRegistry = getProjectRegistry(balance.token.toLowerCase())[0]
    return {
      icon: require(`assets/tokens/${projectRegistry.icon}`),
      token: balance.token,
      type: balance.type,
      balance: formatToUnit(balance.free, decimals, 8),
    }
  })
  return balanceRows
}

const BalanceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(40px, 120px) auto min(160px);
  grid-column-gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-gap: 0.5rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  grid-template-columns: minmax(40px, 80px) auto min(160px);
  grid-column-gap: 0.5rem;
`};
`

const BalanceCell = styled.div`
  align-items: center;
  padding: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.8rem;
`};
`

export const IconWrapper = styled.div`
  grid-area: icon;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%
  max-width: 25px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0;
    margin: 0;
  `};
`

function Balance({ icon, token, type, balance }: BalanceRowProps) {
  return (
    <BalanceRow>
      <BalanceCell style={{ display: 'flex', justifyContent: 'center' }}>
        <IconWrapper>
          <img src={icon} alt={`${token} token icon`} style={{ width: '100%' }} />
        </IconWrapper>
      </BalanceCell>
      <div style={{ display: 'block' }}>
        <BalanceCell style={{ paddingBottom: '0' }}>
          <HeavyText fontSize="14px">{token}</HeavyText>
        </BalanceCell>
        <BalanceCell style={{ paddingTop: '0' }}>
          <SText fontSize="12px">{type}</SText>
        </BalanceCell>
      </div>
      <BalanceCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SText>{balance}</SText>
      </BalanceCell>
    </BalanceRow>
  )
}

export default function Balances() {
  const { chainDecimals } = useSubstrate()
  const balances = useAllBalances()
  const data = React.useMemo(() => structureBalanceData({ balances, decimals: chainDecimals }), [
    balances,
    chainDecimals,
  ])
  const { t } = useTranslation()

  return (
    <>
      <FlatCard>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <SectionTitle style={{ margin: '0' }}>{t(`Balances`)}</SectionTitle>
          <QuestionHelper
            size={12}
            backgroundColor="transparent"
            text={`All balances are shown below. There are two token types, regular tokens and liquidity provider tokens. Liquidity Provider tokens are given to those who added tokens to liquidity pools.`}
          />
        </div>
        {data &&
          data.map((balance, index) => (
            <Balance
              key={index}
              icon={balance.icon}
              token={balance.token}
              type={balance.type}
              balance={balance.balance}
            />
          ))}
      </FlatCard>
    </>
  )
}
