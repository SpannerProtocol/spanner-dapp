import React, { useEffect, useState } from 'react'

export interface Transaction {
  status: 'queued' | 'submitted' | 'cancelled' | 'completed' | 'inblock' | 'invalid' | 'error'
  message: string
}

interface TransactionMsg {
  delay: number
  children: React.ReactNode
}

interface UseTransactionHookProps {
  transactions: Array<Transaction>
  queueTransaction: (newTransaction: Transaction) => void
}

function TransactionMsg(props: TransactionMsg) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setVisible(true)
    }, props.delay)
  }, [props.delay])

  return visible ? (
    <div className="transactionmsg" style={{ zIndex: 'auto', position: 'absolute', top: '400px', left: '400px' }}>
      {props.children}
    </div>
  ) : (
    <div />
  )
}

/**
 * Add a new transaction to the msg queue
 *
 */
export function useTransactionMsg(): UseTransactionHookProps {
  const [transactions, setTransactions] = useState<Array<Transaction>>([])
  const queueTransaction = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction])
  }
  return { transactions, queueTransaction }
}

export default function TransactionMsgProvider() {
  const { transactions } = useTransactionMsg()
  const [visibleMsgs, setVisibleMsgs] = useState<Array<Transaction>>()

  useEffect(() => {
    if (transactions.length === 0) return
    setVisibleMsgs([...transactions])
  }, [transactions])

  return (
    <>
      <div className="transactionmsg">
        {visibleMsgs &&
          visibleMsgs.map((tx, index) => {
            return (
              <TransactionMsg key={index} delay={1000}>
                {tx.message}
              </TransactionMsg>
            )
          })}
      </div>
    </>
  )
}
