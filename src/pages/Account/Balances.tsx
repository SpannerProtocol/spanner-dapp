import { FlatCardPlate, TableCard } from 'components/Card'
import { CenteredRow } from 'components/Row'
import { StandardText } from 'components/Text'
import TransactionHistory from 'components/TransactionHistory'
import { Section } from 'components/Wrapper'
import { BalanceData, useAllBalances } from 'hooks/useQueryBalance'
import { useSubstrate } from 'hooks/useSubstrate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatToUnit } from 'utils/formatUnit'
import MainTable from '../../components/Table'
import getProjectRegistry from '../../utils/getProjectRegistry'

interface BalanceDataProps {
  balances: Array<BalanceData> | undefined
  decimals: number
}

function structureBalanceData(data: BalanceDataProps) {
  const { balances, decimals } = data
  if (!balances) return
  const balanceRows = balances.map((balance) => {
    const projectRegistry = getProjectRegistry(balance.token.toLowerCase())[0]
    return {
      tokenImg: projectRegistry.icon,
      asset: balance.token,
      type: balance.type,
      fee: formatToUnit(balance.feeFrozen, decimals),
      misc: formatToUnit(balance.miscFrozen, decimals),
      free: formatToUnit(balance.free, decimals),
    }
  })
  return balanceRows
}

export default function Balances(): JSX.Element {
  const { chainDecimals } = useSubstrate()
  const balances = useAllBalances()
  const { t } = useTranslation()

  const columns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'tokenImg',
        // eslint-disable-next-line react/display-name
        Cell: (props: any) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const image = require(`assets/tokens/${props.cell.value}`)
          return (
            <div style={{ padding: '0.5rem', textAlign: 'center' }}>
              <img height={34} src={image} alt="token icon" />
            </div>
          )
        },
        id: 'status',
      },
      {
        Header: 'Asset',
        accessor: 'asset',
      },
      {
        Header: 'Type',
        accessor: 'type',
      },
      {
        Header: 'Locked (Fee)',
        accessor: 'fee',
      },
      {
        Header: 'Locked (Misc)',
        accessor: 'misc',
      },
      {
        Header: 'Free',
        accessor: 'free',
      },
    ],
    []
  )
  const data = React.useMemo(() => structureBalanceData({ balances, decimals: chainDecimals }), [
    balances,
    chainDecimals,
  ])

  if (!data) {
    return (
      <>
        <FlatCardPlate
          style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'center' }}
        >
          <StandardText>{t(`Connect to your wallet to view your Balances`)}</StandardText>
        </FlatCardPlate>
      </>
    )
  }
  return (
    <>
      <TableCard>
        <Section>
          <CenteredRow>
            <MainTable columns={columns} data={data} />
          </CenteredRow>
        </Section>
      </TableCard>
      <TransactionHistory />
    </>
  )
}
