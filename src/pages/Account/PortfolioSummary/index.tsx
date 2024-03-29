import { useLazyQuery } from '@apollo/client'
import BN from 'bn.js'
import Card from 'components/Card'
import { Header2, HeavyText, SText, TokenText } from 'components/Text'
import { IconWrapper } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import { UserTransferIn, UserTransferInVariables } from 'queries/graphql/types/UserTransferIn'
import { UserTransferOut, UserTransferOutVariables } from 'queries/graphql/types/UserTransferOut'
import userTransferIn from 'queries/graphql/userTransferIn'
import userTransferOut from 'queries/graphql/userTransferOut'
import { useCallback, useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'

interface TokenDeposits {
  [token: string]: {
    total: BN
    lockedInDpos: BN
    lockedInCabins: BN
    dpoCount: number
    cabinCount: number
  }
}

/**
 * Get Portfolio Balance. In order to ensure no memory overflow issues, this component
 * uses HOC pattern to set the total portfolio balances.
 * @param address: string
 */
export default function PortfolioSummary({ address, selectedToken }: { address: string; selectedToken: string }) {
  const [loadTransferOut, { error: outError, loading: inLoading, data: outData }] = useLazyQuery<
    UserTransferOut,
    UserTransferOutVariables
  >(userTransferOut, {
    variables: {
      address: address,
    },
    fetchPolicy: 'network-only',
  })
  const [loadTransferIn, { error: inError, loading: outLoading, data: inData }] = useLazyQuery<
    UserTransferIn,
    UserTransferInVariables
  >(userTransferIn, {
    variables: {
      address: address,
    },
    fetchPolicy: 'network-only',
  })
  // this component might take awhile so use a loader
  const { t } = useTranslation()
  const [totalDeposited, setTotalDeposited] = useState<TokenDeposits>({})
  const { chainDecimals } = useSubstrate()
  const theme = useContext(ThemeContext)

  const getPortfolioSummaryData = useCallback(() => {
    loadTransferOut()
    loadTransferIn()
  }, [loadTransferOut, loadTransferIn])

  // When lazyquery functions are available, use once for init
  useEffect(() => {
    loadTransferOut()
    loadTransferIn()
  }, [loadTransferOut, loadTransferIn])

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
  }, [chainDecimals, inData, outData])

  return (
    <>
      {inLoading ||
        outLoading ||
        ((inError || outError) && (
          <>
            {(inLoading || outLoading) && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Skeleton height={15} count={1} style={{ margin: '0.5rem 0' }} />
                <Skeleton height={50} count={1} style={{ margin: '0.5rem 0' }} />
              </div>
            )}
          </>
        ))}
      {!(inLoading || outLoading) && !(inError || outError) && totalDeposited[selectedToken] && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Header2 width="fit-content" margin="0">
              {t(`Portfolio Summary`)}
            </Header2>
            <IconWrapper margin="0 0.5rem">
              <RefreshCw onClick={getPortfolioSummaryData} size={'16px'} color={theme.text3} />
            </IconWrapper>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Card minHeight="80px" mobileMinHeight="70px" margin="0 0.5rem" padding="0.75rem">
              <SText mobileFontSize="12px" padding="0 0 0.5rem 0">
                {t(`Total Deposited`)}
              </SText>
              {Object.keys(totalDeposited).includes(selectedToken) && (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <HeavyText fontSize="20px" mobileFontSize="18px" colorIsPrimary>
                    {formatToUnit(totalDeposited[selectedToken].total, chainDecimals)}
                  </HeavyText>
                  <TokenText padding="0 0 0 0.5rem">{selectedToken}</TokenText>
                </div>
              )}
            </Card>
            <Card minHeight="80px" mobileMinHeight="70px" margin="0 0.5rem" padding="0.75rem">
              <SText mobileFontSize="12px" padding="0 0 0.5rem 0">
                {t(`Deposit by Asset`)}
              </SText>
              {Object.keys(totalDeposited).includes(selectedToken) && (
                <div style={{ display: 'block' }}>
                  {totalDeposited[selectedToken].dpoCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <SText fontSize="14px" mobileFontSize="10px" colorIsPrimary>
                        {formatToUnit(totalDeposited[selectedToken].lockedInDpos, chainDecimals)}
                      </SText>
                      <TokenText padding="0 0.25rem 0 0.25rem">{selectedToken}</TokenText>
                      <SText fontSize="14px" mobileFontSize="10px">
                        {` ${t(`in`)} ${totalDeposited[selectedToken].dpoCount} ${t(`DPOs`)}`}
                      </SText>
                    </div>
                  )}
                  {totalDeposited[selectedToken].cabinCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <SText fontSize="14px" mobileFontSize="10px" colorIsPrimary>
                        {formatToUnit(totalDeposited[selectedToken].lockedInCabins, chainDecimals)}
                      </SText>
                      <TokenText padding="0 0.25rem 0 0.25rem">{selectedToken}</TokenText>
                      <SText fontSize="14px" mobileFontSize="10px">
                        {` ${t(`in`)} ${totalDeposited[selectedToken].cabinCount} ${t(`Cabins`)}`}
                      </SText>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  )
}
