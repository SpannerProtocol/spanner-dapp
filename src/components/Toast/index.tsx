import { RowBetween } from 'components/Row'
import { HeavyText, StandardText } from 'components/Text'
import { Section } from 'components/Wrapper'
import { darken } from 'polished'
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { ToastState, useToastContext } from '../../environment/ToastContext'

const ToastMain = styled.div`
  position: fixed;
  top: 50px;
  right: 10px;
  width: 300px;
  max-height: 90vh;
  overflow-y: scroll;
  z-index: 3;
`

const ToastContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const toastInRight = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`

const ToastContainerItem = styled.div<{ backgroundColor?: string }>`
  border: 1px solid transparent;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  word-wrap: break-word;
  background-color: ${({ backgroundColor, theme }) => darken(0.1, backgroundColor ? backgroundColor : theme.primary3)};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  color: #fff;
  transition: transform 0.6s ease-in-out;
  animation: ${toastInRight} 0.7s;
  opacity: 0.9;
`

const ITEM_COLORS = {
  info: '#00B8FF',
  success: '#5BC85B',
  warning: '#FFBD14',
  danger: '#EC3D3D',
}

export default function Toast({ toast }: { toast: ToastState[] }) {
  const { toastDispatch } = useToastContext()

  return (
    <ToastMain className="toast">
      <ToastContainer className="toast-container">
        {toast.map((item) => {
          return (
            <ToastContainerItem
              className={`toast-container-item ${item.type ? item.type : ''}`}
              key={item.id}
              backgroundColor={item.type ? ITEM_COLORS[item.type] : ITEM_COLORS['info']}
            >
              <Section style={{ margin: '0' }}>
                <RowBetween>
                  <HeavyText color="#fff" fontSize="12px">
                    {item.title}
                  </HeavyText>
                  <HeavyText
                    role="img"
                    aria-label="close toast"
                    className="toast-close"
                    style={{ cursor: 'pointer', color: '#fff' }}
                    onClick={() => toastDispatch({ type: 'REMOVE', payload: { id: item.id } })}
                  >
                    &times;
                  </HeavyText>
                </RowBetween>
              </Section>
              <Section style={{ margin: '0' }}>
                <StandardText color="#fff" fontSize="12px">
                  {item.content}
                </StandardText>
              </Section>
            </ToastContainerItem>
          )
        })}
      </ToastContainer>
    </ToastMain>
  )
}
