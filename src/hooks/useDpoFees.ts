import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { createdDpoByData } from 'queries/graphql/createdDpoByData'
import { EventCreatedDpoByData, EventCreatedDpoByDataVariables } from 'queries/graphql/types/EventCreatedDpoByData'
import { useEffect } from 'react'

export default function useDpoFees(dpoIndex: string) {
  const [fees, setFees] = useState<{ management: number; base: number }>()
  // Need to add a better filter or change the data model on SubQL. For now,
  // getting first x and interating should be fine.
  const { data } = useQuery<EventCreatedDpoByData, EventCreatedDpoByDataVariables>(createdDpoByData, {
    variables: {
      includes: `,${dpoIndex}`,
      first: 1000,
      offset: 0,
    },
  })

  useEffect(() => {
    if (!data || !data.events) return
    data.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic || !node.data) return
      const createdDpoIndex: number = JSON.parse(node.data)[1]
      if (createdDpoIndex === parseInt(dpoIndex)) {
        // Management is 3rd argument, no need to divide
        // BaseFee is the 4th argument, needs to divide by 10
        const argsArray: string[] = node.extrinsic.args.split(',')
        if (argsArray[1].includes('dpo')) {
          setFees({ management: parseInt(argsArray[3]), base: parseInt(argsArray[4]) / 10 })
        } else if (argsArray[1].includes('travelCabin')) {
          setFees({ management: parseInt(argsArray[2]), base: parseInt(argsArray[3]) / 10 })
        }
      }
    })
  }, [data, dpoIndex])
  return fees
}
