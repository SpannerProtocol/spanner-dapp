/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import https from 'https'

const bridgeHammerHost = process.env.REACT_APP_HAMMER_BRIDGE_HOST
const bridgeSpannerHost = process.env.REACT_APP_SPANNER_BRIDGE_HOST

let httpAgent: https.Agent

if (process.env.NODE_ENV === 'development') {
  httpAgent = new https.Agent()
} else {
  httpAgent = new https.Agent()
}

function getHost(chain: string) {
  if (chain === 'Hammer') {
    return bridgeHammerHost
  } else if (chain === 'Spanner') {
    return bridgeSpannerHost
  }
}

// All requests to bridge returns promises

// Get the deposit address
export function getEthDepositAddr(chain: 'Hammer' | 'Spanner', spannerAddress: string) {
  const bridgeHost = getHost(chain)
  return axios.get<string>(`${bridgeHost}/eth_deposit_addr`, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
    },
  })
}

// Ethereum to Spanner deposit check
export function postE2sCheck(chain: 'Hammer' | 'Spanner', spannerAddress: string) {
  const bridgeHost = getHost(chain)
  return axios.post<Array<string>>(`${bridgeHost}/e2s_check`, null, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
    },
  })
}

// Get Spanner burn address to send WUSD to
// The server will handle the issuance of USDT to user's Ethereum address
export function getBurnAddr(chain: 'Hammer' | 'Spanner', ethAddress: string) {
  const bridgeHost = getHost(chain)
  return axios.get<string>(`${bridgeHost}/burn_addr`, {
    httpAgent,
    params: {
      eth_addr: ethAddress,
    },
  })
}

// Get Spanner burn address to send WUSD to
// The server will handle the issuance of USDT to user's Ethereum address
export function getFaucet(chain: 'Hammer' | 'Spanner', spannerAddress: string, tokens: string) {
  const bridgeHost = getHost(chain)
  return axios.get<string>(`${bridgeHost}/faucet`, {
    httpAgent,
    params: {
      span_addr: spannerAddress,
      tokens: tokens,
    },
  })
}

/**
 * Get Spanner SS58 custodial address from a custodial address
 * @param ethereumAddress valid ethereum address (hex with 0x)
 */
export function getCustodialAddr(chain: 'Hammer' | 'Spanner', ethereumAddress: string) {
  const bridgeHost = getHost(chain)
  return axios.get<string>(`${bridgeHost}/custodial_addr`, {
    httpAgent,
    params: {
      eth_addr: ethereumAddress,
    },
  })
}

interface CustodialSigningPayload {
  message: {
    declaration: string
    custodialAddress: string
    transaction: {
      section: string
      method: string
      params: Record<string, unknown>
    }
  }
  signingAlgo: string
  signature: string
  ethAddress: string
}

export function postSignature(chain: 'Hammer' | 'Spanner', payload: CustodialSigningPayload) {
  const bridgeHost = getHost(chain)
  return axios.post(`${bridgeHost}/sign`, payload, {
    httpAgent,
  })
}

export function getHealth(chain: 'Hammer' | 'Spanner') {
  const bridgeHost = getHost(chain)
  return axios.get(`${bridgeHost}/health`)
}

// Get the deposit address
export function getBridgeFee(chain: 'Hammer' | 'Spanner') {
  const bridgeHost = getHost(chain)
  return axios.get<{
    fee_bps: number
    fee_min_usd: number
    gas_price_gwei: number
    eth_price_usd: number
    gas_estimate_unit: number
  }>(`${bridgeHost}/fee`, {
    httpAgent,
  })
}
