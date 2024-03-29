import { useCallback, useState } from 'react'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const Icon = styled.img`
  margin: 0.2rem;
  height: 15px;
  :hover {
    cursor: pointer;
  }
`

export default function CopyToClipboard({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <IconWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <Icon src={require('assets/svg/icon-action-copy.svg').default} />
        </IconWrapper>
      </Tooltip>
    </span>
  )
}
