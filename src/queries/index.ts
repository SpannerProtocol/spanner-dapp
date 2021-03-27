/* eslint-disable @typescript-eslint/camelcase */
import { Dispatch, SetStateAction } from 'react'
import {
  SpanfuraExtrinsicsParams,
  postScanExtrinsics,
  postScanEvents,
  SpanfuraExtrinsicsResponse,
  SpanfuraDataExtrinsic,
  SpanfuraEventsResponse,
  SpanfuraDataEvents,
  postPriceData,
  SpanfuraPriceResponse,
  PriceData,
} from 'spanfura'
import { AxiosResponse } from 'axios'
// import { encodeAddress } from '@polkadot/keyring'
import { getUserPublicKey } from 'utils/getWalletInfo'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface TxQueryParams extends SpanfuraExtrinsicsParams {
  setData: Dispatcher<SpanfuraDataExtrinsic[]>
}

interface EventQueryParams extends SpanfuraExtrinsicsParams {
  setData: Dispatcher<SpanfuraDataEvents[]>
  setMeta: Dispatcher<{ count: number }>
}

/**
 * Get Transactions for the provided address.
 */
export function postTxHistory({ row, page, address, success = 'true', setData }: TxQueryParams) {
  postScanExtrinsics({
    row,
    page,
    address,
    success,
  }).then((response: AxiosResponse<SpanfuraExtrinsicsResponse>) => {
    if (!response.data.data.extrinsics) {
      setData([])
      return
    }
    response.data.data.extrinsics.forEach((tx) => {
      setData((prev) => [...prev, tx])
    })
  })
}

/**
 * Get balance.transfers from events api.
 * Addresses returned will be formatted in SS58.
 */
export function postTransfers({ row, page, address, success = 'true', setData, setMeta }: EventQueryParams) {
  if (!address) return
  // Filter for the users address as a hex
  let addressHex = getUserPublicKey(address)
  addressHex = addressHex.slice(2, addressHex.length)
  postScanEvents({
    row,
    page,
    module: 'balances',
    call: 'transfer',
    param_match: `%${addressHex}%`,
    success,
  }).then((response: AxiosResponse<SpanfuraEventsResponse>) => {
    if (!response.data.data.events) {
      setData([])
      return
    }
    // Every call should return a fresh response because pagination is handled server side
    setData([])
    setMeta({ count: response.data.data.count })
    response.data.data.events.forEach((event) => {
      setData((prev) => [...prev, event])
    })
  })
}

export interface GetPriceParam {
  token1: string
  token2: string
  from: number
  interval: number
  setData: Dispatcher<PriceData[]>
}

export function getPrice({ token1, token2, from, interval, setData }: GetPriceParam) {
  postPriceData({ token_1: token1, token_2: token2, from, interval }).then(
    (resp: AxiosResponse<SpanfuraPriceResponse>) => {
      console.log(resp)
      if (!resp.data.data) {
        setData([])
        return
      }
      setData(resp.data.data)
    }
  )
}
