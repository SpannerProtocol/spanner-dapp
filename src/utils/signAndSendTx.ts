/* eslint-disable @typescript-eslint/camelcase */
import { Web3Provider } from '@ethersproject/providers'
import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { Signer } from '@polkadot/api/types'
import { ExtrinsicStatus, EventRecord, Event } from '@polkadot/types/interfaces'
import { CallBase, AnyTuple } from '@polkadot/types/types'
import { postSignature } from 'bridge'
import { ToastAction } from 'contexts/ToastContext'
import { ethers } from 'ethers'
import { Dispatcher } from 'types/dispatcher'
import { WalletInfo } from './getWalletInfo'
import truncateString from './truncateString'
import { isJsonRpcSigner } from './typeguards/signer'

interface TxInfo {
  section: string
  method: string
}

interface SignAndSendCoreParams {
  tx: SubmittableExtrinsic
  txInfo?: TxInfo
  address?: string | null
  wallet?: WalletInfo
  api?: ApiPromise
  setErrorMsg: Dispatcher<string | undefined>
  setHash: Dispatcher<string | undefined>
  setPendingMsg: Dispatcher<string | undefined>
  queueToast: (item: ToastAction) => void
  dismissModal: () => void
  t: any
}

interface SignAndSendParams extends SignAndSendCoreParams {
  signer?: Signer
}

interface SignAndSendCustodialParams extends SignAndSendCoreParams {
  custodialProvider?: Web3Provider
  chain: 'Hammer' | 'Spanner'
}

export interface SignAndSendTxParams extends SignAndSendParams {
  chain: 'Hammer' | 'Spanner'
  signer?: Signer
  custodialProvider?: Web3Provider
}

interface TxStatus {
  api: ApiPromise
  txInfo: TxInfo
  status: ExtrinsicStatus
  events?: EventRecord[]
  setErrorMsg: Dispatcher<string | undefined>
  setHash: Dispatcher<string | undefined>
  setPendingMsg: Dispatcher<string | undefined>
  queueToast: (item: ToastAction) => void
  dismissModal: () => void
  t: any
}

interface TxEventParams {
  api: ApiPromise
  txInfo: TxInfo
  event: Event
  blockTxMethod?: CallBase<AnyTuple>
  queueToast: (item: ToastAction) => void
  dismissModal: () => void
  t: any
}

function handleTxEvent({ api, txInfo, event, blockTxMethod, queueToast, t }: TxEventParams) {
  if (
    api.events.system.ExtrinsicSuccess.is(event) &&
    (blockTxMethod ? txInfo.section === blockTxMethod.section && txInfo.method === blockTxMethod.method : true)
  ) {
    queueToast({
      type: 'ADD',
      payload: {
        title: `${txInfo.section}.${txInfo.method}`,
        content: t(`Transaction succeeded`),
        type: 'success',
      },
    })
  } else if (api.events.system.ExtrinsicFailed.is(event)) {
    const dispatchError = event.data[0]
    let errorInfo
    if (dispatchError.isModule) {
      const decoded = api.registry.findMetaError(dispatchError.asModule)
      errorInfo = `${decoded.section}.${decoded.name}`
    } else {
      // Other, CannotLookup, BadOrigin, no extra info
      errorInfo = dispatchError.toString()
    }
    queueToast({
      type: 'ADD',
      payload: {
        title: `${txInfo.section}.${txInfo.method}`,
        content: `${t(`Transaction failed`)} ${errorInfo}`,
        type: 'danger',
      },
    })
  }
}

function handleTxStatus({
  api,
  txInfo,
  status,
  events,
  setErrorMsg,
  setHash,
  setPendingMsg,
  queueToast,
  dismissModal,
  t,
}: TxStatus) {
  if (status.isInBlock) {
    setErrorMsg(undefined)
    setHash(status.asInBlock.toString())
    setPendingMsg('Transaction submitted to block')
    queueToast({
      type: 'ADD',
      payload: {
        title: `${txInfo.section}.${txInfo.method}`,
        content: `${t(`Submitted to Block`)} ${truncateString(status.asInBlock.toString(), 16)}`,
      },
    })
    // signAndSendCustodial does not send events
    if (!events) {
      api.rpc.chain.getBlock(status.asInBlock.toString()).then((signedBlock) => {
        api.query.system.events.at(signedBlock.block.header.hash).then((allRecords) => {
          signedBlock.block.extrinsics.forEach(({ method }, index) => {
            allRecords
              .filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
              .forEach(({ event }) => {
                handleTxEvent({ api, event, txInfo, blockTxMethod: method, queueToast, dismissModal, t })
              })
          })
        })
      })
    } else {
      // Events are provided via signAndSend
      events.forEach((record) => {
        const { event } = record
        handleTxEvent({ api, event, txInfo, queueToast, dismissModal, t })
      })
    }
  } else if (status.isReady || status.isBroadcast) {
    setErrorMsg(undefined)
    setHash(undefined)
    setPendingMsg(`Transaction pending`)
  } else if (status.isInvalid) {
    setErrorMsg(status.asBroadcast.toString())
    setHash(undefined)
    setPendingMsg(undefined)
  }
}

function signAndSend({
  api,
  tx,
  txInfo,
  address,
  signer,
  setErrorMsg,
  setHash,
  setPendingMsg,
  queueToast,
  dismissModal,
  t,
}: SignAndSendParams) {
  if (!api || !address || !signer || !txInfo) {
    setErrorMsg(t('No wallet detected. Please connect to a wallet and try again.'))
    return
  }
  if (isJsonRpcSigner(signer)) return
  tx.signAndSend(address, { signer }, ({ events = [], status }) => {
    handleTxStatus({ api, txInfo, status, events, setPendingMsg, setHash, setErrorMsg, queueToast, dismissModal, t })
  }).catch((err) => {
    setPendingMsg(undefined)
    setHash(undefined)
    setErrorMsg(`${t(`Transaction failed`)}: ${err}`)
    console.log('Transaction failed ', err)
  })
  dismissModal()
}

function signAndSendCustodial({
  api,
  chain,
  tx,
  wallet,
  address,
  custodialProvider,
  txInfo,
  setErrorMsg,
  setHash,
  setPendingMsg,
  queueToast,
  dismissModal,
  t,
}: SignAndSendCustodialParams) {
  // Section and Method are used to reconstruct the @polkadot/api tx call server-side
  if (!api || !custodialProvider || !address || !txInfo || !wallet || !chain) {
    setErrorMsg(t('Unexpected Error with Custodial Signing operation.'))
    return
  }

  if (!(Object.keys(txInfo).includes('section') && Object.keys(txInfo).includes('method'))) {
    setErrorMsg(t('Could not identify transaction info.'))
    return
  }

  const { section, method } = txInfo

  // Sign with with ethereum provider
  // Returns plaintext message, eth signature, and verified address
  const signAndVerify = async (custodialProvider: Web3Provider, message: string) => {
    const msgHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
    let ethSig = ''
    try {
      // setPendingMsg('Waiting for confirmation on your mobile wallet.')
      ethSig = await custodialProvider.send('personal_sign', [msgHex, address])
    } catch (err) {
      if (err.code === 4001) {
        setErrorMsg(t('Transaction cancelled'))
        return undefined
      }
    }
    const recoveredAddress = ethers.utils.recoverAddress(ethers.utils.hashMessage(message), ethSig)
    const custodialPayload = {
      verified: address === recoveredAddress,
      message: JSON.parse(message),
      signingAlgo: 'secp256k1',
      signature: ethSig,
      ethAddress: recoveredAddress,
    }
    return custodialPayload
  }
  // Get chain spec
  const chainSpec = api.runtimeVersion.specVersion.toNumber()
  const randomNumber = Math.floor(Math.random() * 1000000000000)

  // Format message for custodial wallet to sign
  const paramKeys = tx.meta.args.map((arg) => arg.name.toString())
  const paramsMap: { [index: string]: any } = {}
  paramKeys.forEach((key, index) => (paramsMap[key] = tx.args[index].toJSON()))
  const message = JSON.stringify({
    declaration: 'I authorize Spanner Protocol to sign this transaction on my behalf.',
    custodialAddress: wallet.address,
    transaction: {
      section,
      method,
      params: paramsMap,
    },
    spanner_spec: chainSpec,
    nonce: randomNumber,
  })

  // Use signing server. They use a different key derivation.
  signAndVerify(custodialProvider, message)
    .then((custodialPayload) => {
      if (custodialPayload) {
        postSignature(chain, custodialPayload)
          .then((txSignature) => {
            if (!api) return
            const submittableTx = api.createType('Extrinsic', txSignature.data)
            // Start watching for event first
            api.rpc.author
              .submitAndWatchExtrinsic(submittableTx, (status) =>
                handleTxStatus({
                  api,
                  txInfo,
                  status,
                  setPendingMsg,
                  setHash,
                  setErrorMsg,
                  queueToast,
                  dismissModal,
                  t,
                })
              )
              .catch((err) => {
                console.log(err)
                setErrorMsg(err.message)
              })
          })
          .catch((err) => {
            console.log(err)
            setErrorMsg(err.message)
          })
      }
    })
    .catch((err) => {
      console.log(err)
      setErrorMsg(err.message)
    })
  dismissModal()
}

export default function signAndSendTx({
  api,
  chain,
  tx,
  wallet,
  txInfo,
  setErrorMsg,
  setHash,
  setPendingMsg,
  queueToast,
  dismissModal,
  t,
}: SignAndSendTxParams) {
  if (!wallet || !wallet.address) {
    setErrorMsg(t('No wallet detected. Please connect to a wallet and try again.'))
    return
  }

  if (wallet.type === 'custodial') {
    signAndSendCustodial({
      api,
      chain,
      tx,
      wallet: wallet,
      address: wallet.ethereumAddress,
      custodialProvider: wallet.custodialProvider,
      txInfo,
      setErrorMsg,
      setHash,
      setPendingMsg,
      queueToast,
      dismissModal,
      t,
    })
  } else {
    signAndSend({
      api,
      tx,
      txInfo,
      address: wallet.address,
      signer: wallet.injector?.signer,
      setErrorMsg,
      setHash,
      setPendingMsg,
      queueToast,
      dismissModal,
      t,
    })
  }
}
