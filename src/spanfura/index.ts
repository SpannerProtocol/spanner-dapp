/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import https from 'https'

const spanfuraHost = process.env.REACT_APP_SPANFURA_HOST
let httpAgent: https.Agent

if (process.env.NODE_ENV === 'development') {
  httpAgent = new https.Agent({
    cert: require(process.env.REACT_APP_SPANFURA_SSL_CERT as string),
    rejectUnauthorized: false,
  })
} else {
  httpAgent = new https.Agent()
}

export interface SpanfuraParams {
  row: number
  page: number
  module?: string
  call?: string
  success?: 'true' | false
  param_match?: string
}

export interface SpanfuraExtrinsicsParams extends SpanfuraParams {
  address?: string
}

// Get the deposit address
export function postScanExtrinsics(params: SpanfuraExtrinsicsParams) {
  return axios.post(`${spanfuraHost}/scan/extrinsics`, params, {
    httpAgent,
  })
}

// All Spanfura responses will contain these three fields
interface SpanfuraResponseCore {
  code: number
  message: string
  ttl: number
}

export interface SpanfuraDataExtrinsic {
  block_timestamp: number
  block_num: number
  extrinsic_index: string
  call_module_function: string
  call_module: string
  params: string
  account_id: string
  account_index: string
  signature: string
  nonce: number
  extrinsic_hash: string
  success: boolean
  fee: string
  params_json: Array<{
    name: string
    type: string
    value: any
    valueRaw: string
  }>
}

export interface SpanfuraExtrinsicsResponse {
  data: {
    count: number
    extrinsics: Array<SpanfuraDataExtrinsic>
  }
}

// Interfaces for Events response
export interface SpanfuraDataEvents {
  block_num: number
  block_timestamp: number
  event_id: string
  event_idx: number
  event_index: string
  extrinsic_hash: string
  extrinsic_idx: number
  module_id: string
  params: string
  params_json: Array<{
    type: string
    value: any
  }>
}

export interface SpanfuraEventsResponse extends SpanfuraResponseCore {
  data: {
    count: number
    events: Array<SpanfuraDataEvents>
  }
}

// Ethereum to Spanner deposit check
export function postScanEvents(params: SpanfuraParams) {
  return axios.post(`${spanfuraHost}/scan/events`, params, {
    httpAgent,
  })
}
