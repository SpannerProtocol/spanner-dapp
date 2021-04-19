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
  chain: 'Hammer' | 'Spanner'
  setData: Dispatcher<SpanfuraDataExtrinsic[]>
}

interface EventQueryParams extends SpanfuraExtrinsicsParams {
  chain: 'Hammer' | 'Spanner'
  setData: Dispatcher<SpanfuraDataEvents[]>
  setMeta: Dispatcher<{ count: number }>
}

/**
 * Get Transactions for the provided address.
 */
export function postTxHistory({ chain, row, page, address, success = 'true', setData }: TxQueryParams) {
  postScanExtrinsics(chain, {
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
export function postTransfers({ chain, row, page, address, success = 'true', setData, setMeta }: EventQueryParams) {
  if (!address) return
  // Filter for the users address as a hex
  let addressHex = getUserPublicKey(address)
  addressHex = addressHex.slice(2, addressHex.length)
  postScanEvents(chain, {
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

/**
 * Get currencies.transfers from events api.
 * Addresses returned will be formatted in SS58.
 * Filters out bolt because currencies.transfers includes some but not all bolt transfers
 */
export function postTransfersTokens({
  chain,
  row,
  page,
  address,
  success = 'true',
  setData,
  setMeta,
}: EventQueryParams) {
  if (!address) return
  // Filter for the users address as a hex
  let addressHex = getUserPublicKey(address)
  addressHex = addressHex.slice(2, addressHex.length)
  postScanEvents(chain, {
    row,
    page,
    module: 'currencies',
    call: 'transferred',
    param_match: `%${addressHex}%`,
    success,
  }).then((response: AxiosResponse<SpanfuraEventsResponse>) => {
    if (!response.data.data.events) {
      setData([])
      return
    }
    setData([])
    setMeta({ count: response.data.data.count })
    response.data.data.events.forEach((event) => {
      if (event.params_json[0].value.Token !== 'BOLT') {
        setData((prev) => [...prev, event])
      }
    })
  })
}

export interface GetPriceParam {
  chain: 'Hammer' | 'Spanner'
  token1: string
  token2: string
  from: number
  interval: number
  setData: Dispatcher<PriceData[] | undefined>
}

export function getPrice({ chain, token1, token2, from, interval, setData }: GetPriceParam) {
  postPriceData(chain, { token_1: token1, token_2: token2, from, interval }).then(
    (resp: AxiosResponse<SpanfuraPriceResponse>) => {
      if (!resp.data.data) {
        setData([])
        return
      }
      setData(resp.data.data)
    }
  )
}
