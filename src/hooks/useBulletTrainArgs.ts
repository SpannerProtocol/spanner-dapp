import { useMemo } from 'react'
import { useApi } from './useApi'
import _ from 'lodash'

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
    return obj
  }, [api])
  return argObj
}
