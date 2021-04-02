import { Web3Provider } from '@ethersproject/providers'
import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { Signer } from '@polkadot/api/types'
import { ExtrinsicStatus } from '@polkadot/types/interfaces'
import { postSignature } from 'bridge'
import { Transaction } from 'components/TransactionMsgs'
import { ethers } from 'ethers'
import { Dispatch, SetStateAction } from 'react'
import { WalletInfo } from './getWalletInfo'
import { isJsonRpcSigner } from './typeguards/signer'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface TxInfo {
  section: string
  method: string
}

interface SignAndSendCoreParams {
  tx: SubmittableExtrinsic
  address?: string | null
  wallet?: WalletInfo
  api?: ApiPromise
  queueTransaction?: (tx: Transaction) => void
  setErrorMsg: Dispatcher<string | undefined>
  setHash: Dispatcher<string | undefined>
  setPendingMsg: Dispatcher<string | undefined>
}
interface SignAndSendParams extends SignAndSendCoreParams {
  signer?: Signer
}

interface SignAndSendCustodialParams extends SignAndSendCoreParams {
  custodialProvider?: Web3Provider
  txInfo?: TxInfo
}

interface SignAndSendTxParams extends SignAndSendParams {
  walletType?: string
  signer?: Signer
  custodialProvider?: Web3Provider
  txInfo?: TxInfo
}

interface TxStatus {
  status: ExtrinsicStatus
  queueTransaction?: (tx: Transaction) => void
  setErrorMsg: Dispatcher<string | undefined>
  setHash: Dispatcher<string | undefined>
  setPendingMsg: Dispatcher<string | undefined>
}

function handleTxStatus(params: TxStatus) {
  const { status, queueTransaction, setErrorMsg, setHash, setPendingMsg } = params
  if (status.isInBlock) {
    setErrorMsg(undefined)
    setHash(status.asInBlock.toString())
    setPendingMsg('Transaction submitted to block')
    if (queueTransaction) {
      queueTransaction({ message: 'Transaction submitted to block', status: 'queued' })
    }
    console.log(`Completed at block hash #${status.asInBlock.toString()}`)
  } else if (status.isReady || status.isBroadcast) {
    setErrorMsg(undefined)
    setHash(undefined)
    setPendingMsg(`Transaction pending`)
    console.log(`Current status: ${status.type}`)
  } else if (status.isInvalid) {
    setErrorMsg(status.asBroadcast.toString())
    setHash(undefined)
    setPendingMsg(undefined)
  }
}

function signAndSend(params: SignAndSendParams) {
  const { tx, address, signer, queueTransaction, setErrorMsg, setHash, setPendingMsg } = params
  if (!address || !signer) {
    setErrorMsg('No wallet detected. Please connect to a wallet and try again.')
    return
  }
  if (isJsonRpcSigner(signer)) return
  tx.signAndSend(address, { signer }, ({ status }) => {
    handleTxStatus({ status, queueTransaction, setPendingMsg, setHash, setErrorMsg })
  }).catch((err) => {
    setPendingMsg(undefined)
    setHash(undefined)
    setErrorMsg(`Transaction failed: ${err}`)
    console.log('Transaction failed ', err)
  })
}

function signAndSendCustodial(params: SignAndSendCustodialParams) {
  const { api, tx, wallet, address, custodialProvider, txInfo, setErrorMsg, setHash, setPendingMsg } = params

  // Section and Method are used to reconstruct the @polkadot/api tx call server-side
  if (!custodialProvider || !address || !txInfo || !wallet) {
    setErrorMsg('Unexpected Error with Custodial Signing operation.')
    return
  }

  if (!(Object.keys(txInfo).includes('section') && Object.keys(txInfo).includes('method'))) {
    setErrorMsg('Could not identify transaction info.')
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
        setErrorMsg('Transaction cancelled')
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

  // Format message for custodial wallet to sign
  const paramKeys = tx.meta.args.map((arg) => arg.name.toString())
  const paramsMap: { [index: string]: any } = {}
  paramKeys.forEach((key, index) => (paramsMap[key] = tx.args[index].toHuman()))
  const message = JSON.stringify({
    declaration: 'I authorize Spanner Protocol to sign this transaction on my behalf.',
    custodialAddress: wallet.address,
    transaction: {
      section,
      method,
      params: paramsMap,
    },
  })

  // Use signing server. They use a different key derivation.
  signAndVerify(custodialProvider, message)
    .then((custodialPayload) => {
      if (custodialPayload) {
        postSignature(custodialPayload)
          .then((txSignature) => {
            if (!api) return
            const submittableTx = api.createType('Extrinsic', txSignature.data)
            api.rpc.author
              .submitAndWatchExtrinsic(submittableTx, (status) =>
                handleTxStatus({ status, setPendingMsg, setHash, setErrorMsg })
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
}

export default function signAndSendTx(params: SignAndSendTxParams) {
  const { api, tx, wallet, txInfo, queueTransaction, setErrorMsg, setHash, setPendingMsg } = params
  if (!wallet || !wallet.address) {
    setErrorMsg('No wallet detected. Please connect to a wallet and try again.')
    return
  }

  if (wallet.type === 'custodial') {
    signAndSendCustodial({
      api,
      tx,
      wallet: wallet,
      address: wallet.ethereumAddress,
      custodialProvider: wallet.custodialProvider,
      txInfo,
      setErrorMsg,
      setHash,
      setPendingMsg,
    })
  } else {
    signAndSend({
      tx,
      address: wallet.address,
      signer: wallet.injector?.signer,
      queueTransaction,
      setErrorMsg,
      setHash,
      setPendingMsg,
    })
  }
}
