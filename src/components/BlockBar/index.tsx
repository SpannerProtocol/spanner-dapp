import { useBlockManager } from 'hooks/useBlocks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const BlockWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
    `};
`

const BlockText = styled.div`
  display: inline;
  font-size: 16px;
  font-weight: 700;
  overflow-wrap: break-word;
  color: ${({ theme }) => theme.text2};
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e6ebf2 !important;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  text-align: right;
  padding: 0.5rem;
  border: 0px solid #e6ebf2 !important;
  `};
`

export default function BlockBar() {
  const { lastBlock } = useBlockManager()
  const { t } = useTranslation()
  return (
    <>
      {lastBlock && (
        <>
          <BlockWrapper>
            <BlockText>
              {t(`Block`)} # {lastBlock.toString()}
            </BlockText>
          </BlockWrapper>
        </>
      )}
    </>
  )
}
