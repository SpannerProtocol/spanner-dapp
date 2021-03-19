import { Dispatch, SetStateAction } from 'react'
import { postScanEvents, SpanfuraEventsSchema, SpanfuraEventsDataEvents, SpanfuraParams } from 'spanfura'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface QueryParams extends SpanfuraParams {
  setData: Dispatcher<SpanfuraEventsDataEvents[]>
}

export function postTxHistory({ row, page, module, call, params, address, success = 'true', setData }: QueryParams) {
  postScanEvents({
    row,
    page,
    module,
    call,
    params,
    address,
    success,
  }).then((response) => {
    const eventsData: SpanfuraEventsSchema = response.data
    if (!eventsData.data.events) {
      // Add global error
      return
    }
    eventsData.data.events.forEach((event) => {
      console.log(event)
      setData((prev) => [...prev, event])
    })
  })
}
