import { RowBetween } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import { Section } from 'components/Wrapper'
import { darken } from 'polished'
import React from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'react-feather'
import styled, { keyframes } from 'styled-components'
import { ToastState, useToastContext } from '../../contexts/ToastContext'

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

const ToastInnerGrid = styled.div`
  display: grid;
  grid-template-columns: max(30px) auto;
  grid-column-gap: 0.5rem;
`

const ITEM_COLORS = {
  info: '#00B8FF',
  success: '#5BC85B',
  warning: '#FFBD14',
  danger: '#EC3D3D',
}

const ITEM_ICONS = {
  info: <Info color="#fff" size="24px" />,
  success: <CheckCircle color="#fff" size="24px" />,
  warning: <AlertCircle color="#fff" size="24px" />,
  danger: <XCircle color="#fff" size="24px" />,
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
              backgroundColor={ITEM_COLORS[item.type ? item.type : 'info']}
            >
              <ToastInnerGrid>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {ITEM_ICONS[item.type ? item.type : 'info']}
                </div>
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
                  <Section style={{ margin: '0' }}>
                    <SText color="#fff" fontSize="12px">
                      {item.content}
                    </SText>
                  </Section>
                </Section>
              </ToastInnerGrid>
            </ToastContainerItem>
          )
        })}
      </ToastContainer>
    </ToastMain>
  )
}
