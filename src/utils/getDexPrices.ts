import { TradingPair } from 'interfaces/dex'
import { Balance } from '@polkadot/types/interfaces'
import { ITuple } from '@polkadot/types/types'
import _ from 'lodash'

interface ValidPair {
  isValid: boolean
  validPair: any
  enabledPair: TradingPair | undefined
}

export function getPriceByPair(
  enabledPair: TradingPair | undefined,
  inputPair: any,
  lpTradingPair: ITuple<[Balance, Balance]>
) {
  if (!enabledPair || !inputPair) return
  const currencyIds = enabledPair.map((currencyId) => JSON.parse(currencyId.toString()))
  const lpAmounts = lpTradingPair.map((balance) => parseFloat(balance.toString()))
  if (_.isEqual(inputPair[0], currencyIds[0]) && _.isEqual(inputPair[1], currencyIds[1])) {
    return lpAmounts[1] / lpAmounts[0]
  } else if (_.isEqual(inputPair[0], currencyIds[1]) && _.isEqual(inputPair[1], currencyIds[0])) {
    return lpAmounts[0] / lpAmounts[1]
  } else {
    return NaN
  }
}

export function getEnabledPair(enabledPairs: Array<TradingPair>, inputPair: any): ValidPair {
  let validPair = undefined
  for (const enabledPair of enabledPairs) {
    if (enabledPair.eq(inputPair)) {
      validPair = { isValid: true, validPair: inputPair, enabledPair }
      break
    } else {
      const reversed = [inputPair[1], inputPair[0]]
      if (enabledPair.eq(reversed)) {
        validPair = { isValid: true, validPair: reversed, enabledPair }
      }
    }
  }
  if (!validPair) return { isValid: false, validPair: undefined, enabledPair: undefined }
  return validPair
}
