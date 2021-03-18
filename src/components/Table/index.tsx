import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table'
import SearchBar from 'components/SearchBar'
import { RowBetween } from 'components/Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'

const TableWrapper = styled.div`
  display: block;
  width: 100%;
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
  border-collapse: collapse;
  table-layout: fixed;
`

const THead = styled.thead`
  display: table-header-group;
  vertical-align: middle;
  border-color: inherit;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-top: 1px solid #e6ebf2 !important;
  border-bottom: 1px solid #e6ebf2 !important;
`

const TH = styled.th`
  background-color: #f7f9fc;
  color: #6b7c93 !important;
  text-align: center;
  padding: 1rem;
`

const TBody = styled.tbody`
  display: table-row-group;
  vertical-align: middle;
  border-color: inherit;
`

const TD = styled.td`
  font-size: 14px;
  font-weight: 500;
  color: #0a2540;
  border-top: none !important;
  border-bottom: 1px solid #e6ebf2 !important;
  padding-left: 1rem;
  padding-right: 1rem;
`

const TR = styled.tr`
  display: table-row;
  vertical-align: inherit;
  border-color: inherit;
  text-align: center;
`

const PagButtons = styled.button`
  background: transparent;
  border: none;
  font-weight: 700;
  font-size: 16px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primary1};
  :disabled {
    color: ${({ theme }) => theme.primary2};
  }
`

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface GlobalFilterProps {
  filter: string
  setFilter: Dispatcher<string>
}

function GlobalFilter({ filter, setFilter }: GlobalFilterProps) {
  return (
    <div>
      <SearchBar
        inputType="text"
        placeholder="Search"
        keyword={filter || ''}
        setKeyword={setFilter}
        backgroundColor={'#fff'}
      />
    </div>
  )
}

export default function MainTable({ columns, data }: { columns: Array<any>; data: Array<any> }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
  } = useTable({ columns, data, disableSortRemove: true }, useGlobalFilter, useSortBy, usePagination)

  const { globalFilter, pageIndex } = state
  return (
    <div style={{ display: 'block', paddingBottom: '1rem' }}>
      <RowBetween>
        <div> </div>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      </RowBetween>
      <TableWrapper>
        <Table {...getTableProps()}>
          <THead>
            {headerGroups.map((headerGroup, trkey) => (
              <TR {...headerGroup.getHeaderGroupProps()} key={trkey}>
                {headerGroup.headers.map((column, thkey) => (
                  <TH {...column.getHeaderProps(column.getHeaderProps(column.getSortByToggleProps()))} key={thkey}>
                    {column.render('Header')}
                    <span style={{ verticalAlign: 'middle' }}>
                      {column.isSorted &&
                        (column.isSortedDesc ? (
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            size={'1x'}
                            style={{ color: '#000', margin: '0.25rem' }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faCaretUp} size={'1x'} style={{ color: '#000', margin: '0.25rem' }} />
                        ))}
                    </span>
                  </TH>
                ))}
              </TR>
            ))}
          </THead>
          <TBody {...getTableBodyProps()}>
            {page.map((row, trkey) => {
              prepareRow(row)
              return (
                <TR {...row.getRowProps()} key={trkey}>
                  {row.cells.map((cell, tdkey) => {
                    return (
                      <TD {...cell.getCellProps()} key={tdkey}>
                        {cell.render('Cell')}
                      </TD>
                    )
                  })}
                </TR>
              )
            })}
          </TBody>
        </Table>
      </TableWrapper>
      <PagButtons onClick={() => previousPage()} disabled={!canPreviousPage}>
        {'<'}
      </PagButtons>
      <span>
        Page{' '}
        <strong>
          {pageIndex + 1} of {pageOptions.length}
        </strong>
      </span>
      <PagButtons onClick={() => nextPage()} disabled={!canNextPage}>
        {'>'}
      </PagButtons>
    </div>
  )
}
