import styled from 'styled-components'

export const GridRow = styled.div`
  display: grid;
  grid-template-columns: min(160px) auto;
  grid-column-gap: 40px;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-gap: 5px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: none;
    grid-template-rows: auto;
    grid-row-gap: 0px;
    grid-column-gap: 0px;
    padding: 0.5rem;
`};
`

export const GridCell = styled.div`
  display: block;
  padding: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0.25rem;
`};
`
