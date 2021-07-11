import { SText } from 'components/Text'
import { Section, SpacedSection } from 'components/Wrapper'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Dispatcher } from 'types/dispatcher'
import useTheme from 'utils/useTheme'

const PageButtons = styled.button`
  background: transparent;
  border: none;
  font-weight: 700;
  font-size: 20px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  max-width: 1.5rem;
  color: ${({ theme }) => theme.primary1};
  :disabled {
    color: ${({ theme }) => theme.text5};
  }
`

const PageInput = styled.input`
  max-width: 60px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.text5};
  border-radius: 4px;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
  outline: none;
  -webkit-box-align: stretch;
`

interface PaginationProps {
  currentPage: Dispatcher<number>
  maxPage?: number
}

/**
 * Pagination component.
 * @param currentPage callback to send the current page (for server side pagination)
 * @param maxPage the highest page number to disable next
 * @returns Pagination Component
 */
export default function Pagination({ currentPage, maxPage }: PaginationProps) {
  const [page, setPage] = useState(1)
  const [canPreviousPage, setCanPreviousPage] = useState(false)
  const [canNextPage, setCanNextPage] = useState(true)
  const theme = useTheme()

  const previousPage = useCallback(() => {
    setPage((prev) => (prev > 1 ? prev - 1 : 1))
  }, [])

  const nextPage = useCallback(() => {
    if (maxPage && page >= maxPage) setCanNextPage(false)
    setPage((prev) => (maxPage ? (prev === maxPage ? maxPage : prev + 1) : prev + 1))
  }, [maxPage, page])

  const handleInput = useCallback(
    (value: string) => {
      const inputPage = parseInt(value)
      if (maxPage && inputPage > maxPage) return
      setPage(inputPage)
    },
    [maxPage]
  )

  useEffect(() => {
    page > 1 ? setCanPreviousPage(true) : setCanPreviousPage(false)
    if (maxPage) {
      page < maxPage ? setCanNextPage(true) : setCanNextPage(false)
    }
    if (Number.isNaN(page)) return
    currentPage(page)
  }, [currentPage, maxPage, page])

  return (
    <Section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'inline', width: 'fit-content' }}>
        <PageButtons onClick={previousPage} disabled={!canPreviousPage}>
          {'<'}
        </PageButtons>
        <PageInput
          type="number"
          placeholder={''}
          value={Number.isNaN(page) ? '' : page}
          onChange={(e) => handleInput(e.target.value)}
        />
        <PageButtons onClick={nextPage} disabled={!canNextPage}>
          {'>'}
        </PageButtons>
      </div>
      {maxPage && maxPage !== 0 && (
        <SpacedSection style={{ display: 'inline', width: 'fit-content' }}>
          <SText color={theme.text3}>1 - {maxPage}</SText>
        </SpacedSection>
      )}
    </Section>
  )
}
