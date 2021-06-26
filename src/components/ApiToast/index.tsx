import '@reach/dialog/styles.css'
import { RowBetween } from 'components/Row'
import { HeavyText, SText } from 'components/Text'
import { Section } from 'components/Wrapper'
import { ToastState, useApiToastContext } from 'contexts/ApiToastProvider'
import { darken } from 'polished'
import React, { useContext } from 'react'
import { Circle } from 'react-feather'
import styled, { keyframes, ThemeContext } from 'styled-components'

const ToastMain = styled.div`
  position: fixed;
  bottom: 100px;
  right: 10px;
  width: 300px;
  max-height: 90vh;
  overflow-y: scroll;
  z-index: 1310;
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
  background-color: ${({ backgroundColor, theme }) => darken(0.01, backgroundColor ? backgroundColor : theme.primary3)};
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

export default function ApiToast({ toast }: { toast: ToastState }) {
  const { toastDispatch } = useApiToastContext()
  const theme = useContext(ThemeContext)

  let color = theme.gray1
  if (toast.type === 'danger') {
    color = theme.red1
  } else if (toast.type === 'warning') {
    color = theme.yellow1
  } else if (toast.type === 'info') {
    color = theme.gray1
  } else if (toast.type === 'success') {
    color = theme.green1
  }

  return (
    <>
      {Object.keys(toast).length > 0 && (
        <ToastMain className="toast">
          <ToastContainer className="toast-container">
            <ToastContainerItem
              className={`toast-container-item ${toast.type ? toast.type : ''}`}
              backgroundColor={'#fff'}
            >
              <ToastInnerGrid>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Circle size={10} strokeWidth={1} fill={color} color={color} />
                </div>
                <Section style={{ margin: '0' }}>
                  <RowBetween>
                    <HeavyText>{toast.title}</HeavyText>
                    <HeavyText
                      role="img"
                      aria-label="close toast"
                      className="toast-close"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toastDispatch({ type: 'REMOVE', payload: {} })}
                    >
                      &times;
                    </HeavyText>
                  </RowBetween>
                  {toast.content && (
                    <Section style={{ margin: '0' }}>
                      <SText>{toast.content}</SText>
                    </Section>
                  )}
                  {toast.jsxElement}
                </Section>
              </ToastInnerGrid>
            </ToastContainerItem>
          </ToastContainer>
        </ToastMain>
      )}
    </>
  )
}
