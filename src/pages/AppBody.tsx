import React from 'react'
import styled from 'styled-components'

const BodyWrapper = styled.div<{ backgroundColor?: string }>`
  display: flex;
  flex-direction: column;
  grid-area: content;
  // grid-column-start: 2;
  // grid-row-start: 2;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  padding-top: 0rem;
  background: ${({ backgroundColor, theme }) => (backgroundColor ? backgroundColor : theme.bg2)};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
  `};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BodyWrapper>{children}</BodyWrapper>
    </>
  )
}
