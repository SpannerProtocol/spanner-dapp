import { useCallback, useState } from 'react'
import signAndSendTx from 'utils/signAndSendTx'
import { useApi } from './useApi'
import useWallet from './useWallet'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { formatToUnit } from 'utils/formatUnit'
import { useSubstrate } from './useSubstrate'
import { useTranslation } from 'react-i18next'
import { Dispatcher } from 'types/dispatcher'
import { useToastContext } from 'contexts/ToastContext'
import { useChainState } from 'state/connections/hooks'

export interface CreateTxParams {
  section: string
  method: string
  params: Record<string, unknown>
}

interface TxMeta extends CreateTxParams {
  unsignedTx: SubmittableExtrinsic
}

interface SubmitTxParams {
  setTxErrorMsg: Dispatcher<string | undefined>
  setTxHash: Dispatcher<string | undefined>
  setTxPendingMsg: Dispatcher<string | undefined>
}

export interface TxInfo {
  tx?: SubmittableExtrinsic
  estimatedFee?: string
}

/**
 * Hook to create a submittable unsigned tx and to submit it via signAndSend.
 * Use a confirmation handler to create the tx via createTx. The tx information is stored in this hook in TxMeta.
 * submitTx will signAndSend the tx based off the info in TxMeta.
 */
export default function useTxHelpers() {
  const { api, connected } = useApi()
  const wallet = useWallet()
  const [txMeta, setTxMeta] = useState<TxMeta>()
  const { chainDecimals } = useSubstrate()
  const { t } = useTranslation()
  const { toastDispatch } = useToastContext()
  const { chain } = useChainState()

  // Create both the transaction and get the estimated payment info
  const createTx = ({
    section,
    method,
    params,
  }: CreateTxParams): { unsignedTx: SubmittableExtrinsic; estimatedFee: Promise<string> } | undefined => {
    if (!connected || !wallet || !wallet.address) return
    const txParams = Object.entries(params).map((entry) => entry[1])
    const unsignedTx = api.tx[section][method](...txParams)
    const estimatedFee = unsignedTx
      .paymentInfo(wallet.address)
      .then((fee) => formatToUnit(fee.partialFee.toString(), chainDecimals, 2))
    // Saving the transaction information in the event submitTx is called
    setTxMeta({ unsignedTx, section, method, params })
    toastDispatch({ type: 'ADD', payload: { title: `${section}.${method}`, content: `Transaction created` } })
    return { unsignedTx, estimatedFee }
  }

  // Use signAndSend and output any errors
  const submitTx = useCallback(
    ({ setTxErrorMsg, setTxHash, setTxPendingMsg }: SubmitTxParams) => {
      if (!connected || !chain) return
      if (!wallet || !wallet.address) {
        setTxErrorMsg(t(`No wallet connection detected.`))
        return
      }
      if (!txMeta) {
        setTxErrorMsg(t(`There was an error creating the transaction. Please try again.`))
      } else {
        signAndSendTx({
          api: api,
          chain: chain.chain,
          tx: txMeta.unsignedTx,
          wallet: wallet,
          signer: wallet.injector?.signer,
          setErrorMsg: setTxErrorMsg,
          setHash: setTxHash,
          setPendingMsg: setTxPendingMsg,
          toastDispatch: toastDispatch,
          walletType: wallet.type,
          custodialProvider: wallet.custodialProvider,
          txInfo: {
            section: txMeta.section,
            method: txMeta.method,
          },
        })
      }
    },
    [api, connected, t, toastDispatch, txMeta, wallet, chain]
  )

  return { createTx, submitTx }
}
