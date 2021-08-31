import React from 'react'
import styled from 'styled-components'
import useCopyClipboard from '../../hooks/useCopyClipboard'
import { LinkStyledButton } from '../../theme'
import { CheckCircle, Copy } from 'react-feather'

const CopyIcon = styled(LinkStyledButton)<{ width?: string }>`
  color: ${({ theme }) => theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: 0.825rem;
  padding: 0;
  width: ${({ width }) => (width ? width : 'fit-content')}
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

const CopyIconDiv = styled.div<{ width?: string }>`
  color: ${({ theme }) => theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: 0.825rem;
  padding: 0;
  width: ${({ width }) => (width ? width : 'fit-content')}
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

interface CopyHelperProps {
  toCopy: string
  copiedText?: string
  childrenIsIcon?: boolean
  children?: React.ReactNode
  width?: string
}

export default function CopyHelper(props: CopyHelperProps) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)} width={props.width}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={'16'} />
          <TransactionStatusText>{props.copiedText ? props.copiedText : 'Copied'}</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <>
          {props.children}
          <TransactionStatusText>{props.childrenIsIcon ? <div /> : <Copy size={'16'} />}</TransactionStatusText>
        </>
      )}
    </CopyIcon>
  )
}

export function CopyWrapper(props: CopyHelperProps) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <CopyIconDiv onClick={() => setCopied(props.toCopy)} width={props.width}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={'16'} />
          <TransactionStatusText>{props.copiedText ? props.copiedText : 'Copied'}</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <>
          {props.children}
          <TransactionStatusText>{props.childrenIsIcon ? <div /> : <Copy size={'16'} />}</TransactionStatusText>
        </>
      )}
    </CopyIconDiv>
  )
}
