import { FlatCard } from '../../components/Card'
import React, { useEffect, useMemo, useState } from 'react'
import { HomeSectionLabel1, HomeSectionTitle, HomeSectionValue1 } from './index'
import { useLazyQuery, useQuery } from '@apollo/client'
import { UserTransferOut, UserTransferOutVariables } from '../../queries/graphql/types/UserTransferOut'
import userTransferOut from '../../queries/graphql/userTransferOut'
import { UserTransferIn, UserTransferInVariables } from '../../queries/graphql/types/UserTransferIn'
import userTransferIn from '../../queries/graphql/userTransferIn'
import { useSubstrate } from '../../hooks/useSubstrate'
import BN from 'bn.js'
import useWallet from '../../hooks/useWallet'
import { useProjectState } from '../../state/project/hooks'
import { ApolloError } from '@apollo/client/errors'
import { formatToUnit } from '../../utils/formatUnit'
import { PairPrice, PairPriceVariables } from '../../queries/graphql/types/PairPrice'
import pairPrice from '../../queries/graphql/pairPrice'
import { useTranslation } from 'react-i18next'

interface TokenDeposits {
  [token: string]: {
    total: BN
    lockedInDpos: BN
    lockedInCabins: BN
    dpoCount: number
    cabinCount: number
  }
}

function useGetDeposited(address: string) {
  const [loadTransferOut, { error: outError, loading: inLoading, data: outData }] = useLazyQuery<
    UserTransferOut,
    UserTransferOutVariables
  >(userTransferOut, {
    variables: {
      address: address,
    },
  })
  const [loadTransferIn, { error: inError, loading: outLoading, data: inData }] = useLazyQuery<
    UserTransferIn,
    UserTransferInVariables
  >(userTransferIn, {
    variables: {
      address: address,
    },
  })
  // this component might take awhile so use a loader
  const [loading, setLoading] = useState<boolean>(true)
  const [totalDeposited, setTotalDeposited] = useState<TokenDeposits>({})
  const { chainDecimals } = useSubstrate()
  const [error, setError] = useState<ApolloError>()

  // When lazyquery functions are available, use once for init
  useEffect(() => {
    loadTransferOut()
    loadTransferIn()
  }, [loadTransferOut, loadTransferIn])

  useEffect(() => {
    if (outError) {
      setError(outError)
    } else if (inError) {
      setError(inError)
    }
  }, [inError, outError])

  useEffect(() => {
    if (inLoading || outLoading) {
      setLoading(true)
    }
  }, [inLoading, outLoading])

  useEffect(() => {
    if (!outData || !outData.account || !outData.account.transferOut || !outData.account.transferOut.nodes) return
    if (!inData || !inData.account || !inData.account.transferIn || !inData.account.transferIn.nodes) return
    const totalOutNodes = outData.account.transferOut.nodes
    const totalInNodes = inData.account.transferIn.nodes
    const tokenDeposits: TokenDeposits = {}
    totalOutNodes.forEach((node) => {
      if (!node || !node.amount || !node.event || !node.event.extrinsic) return
      const amount = new BN(node.amount.toString())
      const token: string = node.token.toString()
      if (!Object.keys(tokenDeposits).includes(token)) {
        tokenDeposits[token] = {
          total: new BN(0),
          lockedInDpos: new BN(0),
          lockedInCabins: new BN(0),
          dpoCount: 0,
          cabinCount: 0,
        }
      }
      const extrinsicCalled = node.event.extrinsic.method
      if (['createDpo', 'passengerBuyDpoSeats', 'passengerBuyTravelCabin'].includes(extrinsicCalled)) {
        // amount is with chainDecimals
        tokenDeposits[token]['total'] = tokenDeposits[token]['total'].add(amount)
        if (extrinsicCalled === 'createDpo' || extrinsicCalled === 'passengerBuyDpoSeats') {
          tokenDeposits[token]['lockedInDpos'] = tokenDeposits[token]['lockedInDpos'].add(amount)
          tokenDeposits[token]['dpoCount'] = tokenDeposits[token]['dpoCount'] + 1
        }
        if (extrinsicCalled === 'passengerBuyTravelCabin') {
          tokenDeposits[token]['lockedInCabins'] = tokenDeposits[token]['lockedInCabins'].add(amount)
          tokenDeposits[token]['cabinCount'] = tokenDeposits[token]['cabinCount'] + 1
        }
      }
    })
    // Subtract any portfolio amounts that have received deposits back from transferIn
    totalInNodes.forEach((node) => {
      if (!node || !node.amount || !node.event || !node.event.extrinsic) return
      // amount is with chainDecimals
      const amount = new BN(node.amount.toString())
      const token: string = node.token.toString()
      const extrinsicCalled = node.event.extrinsic.method
      if (['releaseFareFromDpo', 'withdrawFareFromTravelCabin'].includes(extrinsicCalled)) {
        tokenDeposits[token]['total'] = tokenDeposits[token]['total'].sub(amount)
        if (extrinsicCalled === 'releaseFareFromDpo') {
          tokenDeposits[token]['lockedInDpos'] = tokenDeposits[token]['lockedInDpos'].sub(amount)
          tokenDeposits[token]['dpoCount'] = tokenDeposits[token]['dpoCount'] - 1
        }
        if (extrinsicCalled === 'withdrawFareFromTravelCabin') {
          tokenDeposits[token]['lockedInCabins'] = tokenDeposits[token]['lockedInCabins'].sub(amount)
          tokenDeposits[token]['cabinCount'] = tokenDeposits[token]['cabinCount'] - 1
        }
      }
    })
    setTotalDeposited(tokenDeposits)
    setLoading(false)
  }, [chainDecimals, inData, outData])
  return { loading, error, totalDeposited }
}

interface ChartParams {
  timestamp: number
  price: number
}

function useFetchLastPrice(token1: string, token2: string) {
  const { loading, error, data } = useQuery<PairPrice, PairPriceVariables>(pairPrice, {
    variables: {
      pairId: `${token1}-${token2}`,
      first: 60,
      offset: 0,
    },
  })

  const [priceData, setPriceData] = useState<(ChartParams | undefined)[]>()
  useEffect(() => {
    if (!data || !data.pair) return
    const prices = data.pair.pairHourData.nodes.map((node) => {
      if (!node) return undefined
      return {
        timestamp: parseInt(node.hourStartTime),
        price: token1 === 'BOLT' ? parseFloat(node.price) : 1 / parseFloat(node.price),
      }
    })
    if (!prices) return
    setPriceData(prices)
  }, [data, token1])

  if (loading || error) {
    return 0
  }

  if (priceData && priceData[0]) {
    return priceData[0].price
  } else {
    return 0
  }
}

export function UserAssetSummaryContainer() {
  const wallet = useWallet()
  const project = useProjectState()

  if (wallet === undefined || wallet.address === undefined) {
    return <UserAssetSummary totalDeposited={'0'} />
  }

  const address = wallet.address
  const selectedToken = project.selectedProject ? project.selectedProject.token : 'BOLT'

  console.log(`address:${address}`)
  console.log(`selectedToken:${selectedToken}`)
  return <UserAssetSummaryFetch address={address} token={selectedToken} />
}

export function UserAssetSummaryFetch({ address, token }: { address: string; token: string }) {
  const { loading, error, totalDeposited } = useGetDeposited(address)
  const { chainDecimals } = useSubstrate()

  const [token1, token2] = useMemo(() => {
    if (token === 'BOLT') {
      return ['BOLT', 'WUSD']
    } else {
      return ['WUSD', token]
    }
  }, [token])

  const price = useFetchLastPrice(token1, token2)

  if (loading || error) {
    return <UserAssetSummary totalDeposited={'0'} />
  }

  if (!totalDeposited[token]) {
    return <UserAssetSummary totalDeposited={'0'} />
  }
  const depositedToken = totalDeposited[token].total
  const totalDepositedAmountBn = depositedToken.muln(price * 100000).divn(100000)
  const totalDepositedAmount = formatToUnit(totalDepositedAmountBn, chainDecimals)
  return <UserAssetSummary totalDeposited={totalDepositedAmount} />
}

export function UserAssetSummary({ totalDeposited }: { totalDeposited: string }) {
  const { t } = useTranslation()
  return (
    <FlatCard style={{ textAlign: 'left' }}>
      <HomeSectionTitle>{t('User Asset')}</HomeSectionTitle>
      <HomeSectionLabel1>{t('Total Deposited')}</HomeSectionLabel1>
      <HomeSectionValue1>{`≈ $${totalDeposited}`}</HomeSectionValue1>
      {/*<HomeSectionLabel1>{'Earned Yesterday'}</HomeSectionLabel1>*/}
      {/*<HomeSectionValue1>{'$198.04'}</HomeSectionValue1>*/}
    </FlatCard>
  )
}
