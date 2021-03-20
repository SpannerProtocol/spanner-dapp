import { Dispatch, SetStateAction } from 'react'
import {
  SpanfuraExtrinsicsParams,
  postScanExtrinsics,
  SpanfuraExtrinsicsResponse,
  SpanfuraDataExtrinsic,
} from 'spanfura'
import { AxiosResponse } from 'axios'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface QueryParams extends SpanfuraExtrinsicsParams {
  setData: Dispatcher<SpanfuraDataExtrinsic[]>
}

export function postTxHistory({ row, page, module, call, params, address, success = 'true', setData }: QueryParams) {
  postScanExtrinsics({
    row,
    page,
    module,
    call,
    params,
    address,
    success,
  }).then((response: AxiosResponse<SpanfuraExtrinsicsResponse>) => {
    console.log('response:', response)
    if (!response.data.data.extrinsics) {
      setData([])
      return
    }
    response.data.data.extrinsics.forEach((tx) => {
      setData((prev) => [...prev, tx])
    })
  })
}
