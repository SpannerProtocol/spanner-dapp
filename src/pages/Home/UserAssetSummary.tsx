import { useLazyQuery, useQuery } from '@apollo/client'
import { ApolloError } from '@apollo/client/errors'
import BN from 'bn.js'
import { FakeButton } from 'components/Button'
import { RowFixed } from 'components/Row'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import Card from '../../components/Card'
import { SLink } from '../../components/Link'
import { Header2, HeavyText, SText, TokenText } from '../../components/Text'
import { useSubstrate } from '../../hooks/useSubstrate'
import useWallet from '../../hooks/useWallet'
import { extrinsicsCountByAddress } from '../../queries/graphql/extrinsics'
import pairPrice from '../../queries/graphql/pairPrice'
import {
  ExtrinsicsCountByAddress,
  ExtrinsicsCountByAddressVariables,
} from '../../queries/graphql/types/ExtrinsicsCountByAddress'
import { PairPrice, PairPriceVariables } from '../../queries/graphql/types/PairPrice'
import { UserTransferIn, UserTransferInVariables } from '../../queries/graphql/types/UserTransferIn'
import { UserTransferOut, UserTransferOutVariables } from '../../queries/graphql/types/UserTransferOut'
import userTransferIn from '../../queries/graphql/userTransferIn'
import userTransferOut from '../../queries/graphql/userTransferOut'
import { useChainState } from '../../state/connections/hooks'
import { useProjectState } from '../../state/project/hooks'
import { formatToUnit } from '../../utils/formatUnit'

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

  const [loadExtrinsicsCount, { loading, data }] = useLazyQuery<
    ExtrinsicsCountByAddress,
    ExtrinsicsCountByAddressVariables
  >(extrinsicsCountByAddress, {
    variables: {
      address: wallet && wallet.address ? wallet.address : '',
    },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!wallet || !wallet.address) return
    loadExtrinsicsCount()
  }, [loadExtrinsicsCount, wallet])

  if (wallet === undefined || wallet.address === undefined) {
    return (
      <Card margin="0">
        <NewUserAdvice />
      </Card>
    )
  }

  const address = wallet.address
  const selectedToken = project.selectedProject ? project.selectedProject.token : 'BOLT'

  return (
    <Card margin="0">
      {loading ? (
        <Skeleton count={3} height={25} style={{ margin: '0.5rem 0' }} />
      ) : data && data.extrinsics && data.extrinsics.totalCount > 0 ? (
        <UserAssetSummaryFetch address={address} token={selectedToken} />
      ) : (
        <NewUserAdvice />
      )}
    </Card>
  )
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
    return <UserAssetSummary totalDepositedBOLT={'0'} totalDepositedUSD={'0'} />
  }

  if (!totalDeposited[token]) {
    return <UserAssetSummary totalDepositedBOLT={'0'} totalDepositedUSD={'0'} />
  }
  const depositedToken = totalDeposited[token].total
  const totalDepositedUsdBn = depositedToken.muln(price * 100000).divn(100000)
  const totalDepositedUsd = formatToUnit(totalDepositedUsdBn, chainDecimals)
  const totalDepositedBolt = formatToUnit(depositedToken, chainDecimals)
  return <UserAssetSummary totalDepositedBOLT={totalDepositedBolt} totalDepositedUSD={totalDepositedUsd} />
}

export function UserAssetSummary({
  totalDepositedBOLT,
  totalDepositedUSD,
}: {
  totalDepositedBOLT: string
  totalDepositedUSD: string
}) {
  const { t } = useTranslation()
  return (
    <>
      <Header2>{t('Your portfolio value')}</Header2>
      <HeavyText>{t('Total Deposited')}</HeavyText>
      <RowFixed align="baseline">
        <HeavyText fontSize="40px" mobileFontSize="30px" colorIsPrimary>
          {`${totalDepositedBOLT}`}
        </HeavyText>
        <TokenText fontSize="16px" mobileFontSize="14px" padding="0 0.5rem">
          BOLT
        </TokenText>
      </RowFixed>
      <SText padding={'0.1rem 0.5rem'}>{`≈ ${totalDepositedUSD} USD`}</SText>
    </>
  )
}

export function NewUserAdvice() {
  const { t } = useTranslation()
  let linkUrl = ''
  let message = ''
  let buttonText = ''

  const { chain } = useChainState()

  if (chain && chain.chain === 'Spanner') {
    linkUrl = '/bridge'
    message = 'Start by transferring crypto to Spanner with our Bridge'
    buttonText = 'Use Bridge'
  } else if (chain && chain.chain === 'Hammer') {
    linkUrl = '/faucet'
    message = 'Get FREE BOLT to play with on Hammer Testnet'
    buttonText = 'Use Faucet'
  }

  return (
    <>
      <Header2>{t(`New to Spanner?`)}</Header2>
      <SText fontSize="22px" mobileFontSize="18px">
        {t(message)}
      </SText>
      <SLink padding="1rem 0" to={linkUrl}>
        <FakeButton margin="1rem 0" mobileMargin="1rem 0">
          {t(buttonText)}
        </FakeButton>
      </SLink>
    </>
  )
}
