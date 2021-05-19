import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { createdDpoByData } from 'queries/graphql/createdDpoByData'
import { EventCreatedDpoByData, EventCreatedDpoByDataVariables } from 'queries/graphql/types/EventCreatedDpoByData'
import { useEffect } from 'react'

export default function useDpoFees(dpoIndex: string) {
  const [fees, setFees] = useState<{ management: number; base: number }>()
  const { data } = useQuery<EventCreatedDpoByData, EventCreatedDpoByDataVariables>(createdDpoByData, {
    variables: {
      endsWith: `,${dpoIndex}]`,
      first: 1,
      offset: 0,
    },
  })

  useEffect(() => {
    if (!data || !data.events) return
    data.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic) return
      // Management is 3rd argument, no need to divide
      // BaseFee is the 4th argument, needs to divide by 10
      const argsArray: string[] = node.extrinsic.args.split(',')
      setFees({ management: JSON.parse(argsArray[2]), base: JSON.parse(argsArray[3]) / 10 })
    })
  }, [data])
  return fees
}
