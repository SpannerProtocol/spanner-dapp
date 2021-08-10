import { useMemo } from 'react'
import { useApi } from './useApi'
import _ from 'lodash'

const spec100to104: { [key: string]: string[] } = {
  passengerBuyDpoSeats: ['target_dpo_idx', 'number_of_seats', 'referrer_account'],
  dpoBuyDpoSeats: ['buyer_dpo_idx', 'target_dpo_idx', 'number_of_seats'],
}

/**
 * Get the names of all bullettrain method arguments
 * @returns object e.g. {method: string[]}
 */
export default function useBulletTrainArgs() {
  const { api } = useApi()
  const argObj = useMemo(() => {
    const methods = Object.keys(api.tx.bulletTrain)
    const obj: { [key: string]: string[] } = {}
    methods.forEach((method) => {
      obj[method] = api.tx.bulletTrain[method].meta.args.map((arg) => _.camelCase(arg.name.toString()))
    })
    const oldMethods = Object.keys(spec100to104)
    oldMethods.forEach((method) => {
      obj[method] = spec100to104[method].map((arg) => _.camelCase(arg))
    })
    return obj
  }, [api])
  return argObj
}
