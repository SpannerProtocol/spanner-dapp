import { Web3Provider } from '@ethersproject/providers'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { Signer } from '@polkadot/api/types'
import { ExtrinsicStatus } from '@polkadot/types/interfaces'
import { ethers } from 'ethers'
import { Dispatch, SetStateAction } from 'react'
import getCustodialAccount from './getCustodialAccount'
import { isJsonRpcSigner } from './typeguards/signer'
import { Transaction } from 'components/TransactionMsgs'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface TxInfo {
  section: string
  method: string
}

interface SignAndSendCoreParams {
  tx: SubmittableExtrinsic
  address?: string | null
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
  transaction?: TxInfo
}

interface SignAndSendTxParams extends SignAndSendParams {
  walletType?: string
  signer?: Signer
  custodialProvider?: Web3Provider
  transaction?: TxInfo
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
    setHash(undefined)
    setPendingMsg('Transaction submitted to block')
    if (queueTransaction) {
      queueTransaction({ message: 'Transaction submitted to block', status: 'queued' })
    }
    console.log(`Completed at block hash #${status.asInBlock.toString()}`)
  } else if (status.isFinalized) {
    setErrorMsg(undefined)
    setPendingMsg(undefined)
    setHash(status.asFinalized.toString())
    if (queueTransaction) {
      queueTransaction({
        message: 'Finalized at block hash #' + status.asFinalized.toString(),
        status: 'queued',
      })
    }
    console.log(`Finalized at block hash #${status.asFinalized.toString()}`)
  } else if (status.isInvalid) {
    setErrorMsg(status.asBroadcast.toString())
    setHash(undefined)
    setPendingMsg(undefined)
  } else {
    setErrorMsg(undefined)
    setHash(undefined)
    setPendingMsg('Transaction pending')
    console.log(`Current status: ${status.type}`)
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
  const { tx, address, custodialProvider, transaction, setErrorMsg, setHash, setPendingMsg } = params

  // Section and Method are used to reconstruct the @polkadot/api tx call server-side
  if (!custodialProvider || !address || !transaction) {
    setErrorMsg('Unexpected Error with Custodial Signing operation.')
    return
  }

  if (!(Object.keys(transaction).includes('section') && Object.keys(transaction).includes('method'))) {
    setErrorMsg('Could not identify tx info. Please contact Spanner.')
    return
  }

  const { section, method } = transaction

  // Sign with with ethereum provider
  // Returns plaintext message, eth signature, and verified address
  const signAndVerify = async (custodialProvider: Web3Provider, message: string) => {
    const msgHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
    let ethSig = ''
    try {
      setPendingMsg('Waiting for confirmation on your mobile wallet.')
      ethSig = await custodialProvider.send('personal_sign', [msgHex, address])
    } catch (err) {
      setErrorMsg(err)
    }
    const recoveredAddress = ethers.utils.recoverAddress(ethers.utils.hashMessage(message), ethSig)
    const custodialPayload = {
      verified: address === recoveredAddress,
      cryptoAlgo: 'secp256k1',
      message: JSON.parse(message),
      signature: ethSig,
      ethAddress: recoveredAddress,
    }
    return custodialPayload
  }
  const spannerAccount = getCustodialAccount(address)
  const paramKeys = tx.meta.args.map((arg) => arg.name.toString())
  const paramsMap: { [index: string]: any } = {}
  paramKeys.forEach((key, index) => (paramsMap[key] = tx.args[index].toHuman()))
  const message = JSON.stringify(
    {
      declaration: 'I authorize Spanner Protocol to sign this transaction on my behalf.',
      custodialAddress: spannerAccount.address.toString(),
      transaction: {
        section,
        method,
        params: paramsMap,
      },
    },
    null,
    1
  )

  signAndVerify(custodialProvider, message)
    .then((ethAccount) => {
      if (!ethAccount.verified) {
        setErrorMsg('Message signature does not match custodial wallet address.')
        return
      }
    })
    .then(() => {
      tx.signAsync(spannerAccount)
        .then(() => {
          tx.send(({ status }) => {
            handleTxStatus({ status, setPendingMsg, setHash, setErrorMsg })
          })
        })
        .catch((err) => {
          setPendingMsg(undefined)
          setHash(undefined)
          setErrorMsg(`Transaction failed: ${err}`)
          console.log('Transaction failed ', err)
        })
    })
}

export default function signAndSendTx(params: SignAndSendTxParams) {
  const {
    tx,
    address,
    signer,
    walletType,
    custodialProvider,
    transaction,
    queueTransaction,
    setErrorMsg,
    setHash,
    setPendingMsg,
  } = params
  if (!walletType || !address) {
    setErrorMsg('No wallet detected. Please connect to a wallet and try again.')
    return
  }
  if (walletType === 'custodial') {
    signAndSendCustodial({ tx, address, custodialProvider, transaction, setErrorMsg, setHash, setPendingMsg })
  } else {
    signAndSend({ tx, address, signer, queueTransaction, setErrorMsg, setHash, setPendingMsg })
  }
}
