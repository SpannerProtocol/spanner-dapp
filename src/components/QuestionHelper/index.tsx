import React, { useCallback, useState } from 'react'
import { HelpCircle as Question } from 'react-feather'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div<{ backgroundColor?: string; padding?: string; color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ padding }) => (padding ? padding : '0.2rem')};
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  background-color: ${({ backgroundColor, theme }) => (backgroundColor ? backgroundColor : theme.bg2)};
  color: ${({ color, theme }) => (color ? color : theme.text2)};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const LightQuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.white};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const QuestionMark = styled.span`
  font-size: 1rem;
`

export default function QuestionHelper({
  text,
  size = 16,
  backgroundColor,
  color,
  padding,
}: {
  text: string
  size?: number
  backgroundColor?: string
  color?: string
  padding?: string
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span>
      <Tooltip text={text} show={show}>
        <QuestionWrapper
          onClick={open}
          onMouseEnter={open}
          onMouseLeave={close}
          backgroundColor={backgroundColor}
          color={color}
          padding={padding}
        >
          <Question size={size} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}

export function LightQuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightQuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </LightQuestionWrapper>
      </Tooltip>
    </span>
  )
}

export function AnyQuestionHelper({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <div onClick={open} onMouseEnter={open} onMouseLeave={close}>
          {children}
        </div>
      </Tooltip>
    </span>
  )
}
