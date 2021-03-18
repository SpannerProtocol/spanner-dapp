/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import https from 'https'

const spanfuraHost = process.env.REACT_APP_SPANFURA_HOST
let httpAgent: https.Agent

if (process.env.NODE_ENV === 'development') {
  httpAgent = new https.Agent({
    cert: require(process.env.REACT_APP_SPANFURA_SSL_CERT as string),
    key: require(process.env.REACT_APP_SPANFURA_SSL_KEY as string),
    rejectUnauthorized: false,
  })
} else {
  httpAgent = new https.Agent({
    cert: process.env.REACT_APP_SPANFURA_SSL_CERT,
    key: process.env.REACT_APP_SPANFURA_SSL_KEY,
  })
}

interface SpanfuraParams {
  row: number
  page: number
  module: string
  call: string
  success: string
  params?: string
  address?: string
}

// Get the deposit address
export function postScanExtrinsics(params: SpanfuraParams) {
  return axios.post<string>(`${spanfuraHost}/api/scan/extrinsics`, params, {
    httpAgent,
  })
}

// Interfaces for Events response
interface SpanfuraEventsDataEventsParamsJson {
  type: string
  value: any
}

interface SpanfuraEventsDataEvents {
  block_num: number
  block_timestamp: number
  event_id: string
  event_idx: number
  event_index: string
  extrinsic_hash: string
  extrinsic_idx: number
  module_id: string
  params: string
  params_json: Array<SpanfuraEventsDataEventsParamsJson>
}

interface SpanfuraEventsData {
  count: number
  events: Array<SpanfuraEventsDataEvents>
}

export interface SpanfuraEventsSchema {
  code: number
  data: SpanfuraEventsData
  message: string
  ttl: number
}

// Ethereum to Spanner deposit check
export function postScanEvents(params: SpanfuraParams) {
  return axios.post(`${spanfuraHost}/api/scan/events`, params, {
    httpAgent,
  })
}
