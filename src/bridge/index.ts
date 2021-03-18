/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import https from 'https'

const bridgeHost = process.env.REACT_APP_BRIDGE_HOST
let httpAgent: https.Agent

if (process.env.NODE_ENV === 'development') {
  httpAgent = new https.Agent({
    cert: require(process.env.REACT_APP_BRIDGE_SSL_CERT as string),
    key: require(process.env.REACT_APP_BRIDGE_SSL_KEY as string),
    rejectUnauthorized: false,
  })
} else {
  httpAgent = new https.Agent({
    cert: process.env.REACT_APP_BRIDGE_SSL_CERT,
    key: process.env.REACT_APP_BRIDGE_SSL_KEY,
  })
}

// All requests to bridge returns promises

// Get the deposit address
export function getEthDepositAddr(spannerAddress: string) {
  return axios.get<string>(`${bridgeHost}/bridge/eth_deposit_addr`, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
    },
  })
}

// Ethereum to Spanner deposit check
export function postE2sCheck(spannerAddress: string) {
  return axios.post<Array<string>>(`${bridgeHost}/bridge/e2s_check`, null, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
    },
  })
}

// Get Spanner burn address to send WUSD to
// The server will handle the issuance of USDT to user's Ethereum address
export function getBurnAddr(ethAddress: string) {
  return axios.get<string>(`${bridgeHost}/bridge/burn_addr`, {
    httpAgent,
    params: {
      eth_addr: ethAddress,
    },
  })
}

// Get Spanner burn address to send WUSD to
// The server will handle the issuance of USDT to user's Ethereum address
export function getFaucet(spannerAddress: string, tokens: string) {
  return axios.get<string>(`${bridgeHost}/bridge/faucet`, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
      tokens: tokens,
    },
  })
}
