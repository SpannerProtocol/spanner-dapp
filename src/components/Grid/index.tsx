import styled from 'styled-components'

export const Grid = styled.div<{ columns?: string; mobileColumns?: string }>`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(
    ${({ columns }) => (columns ? columns : '1')},
    minmax(0, ${({ columns }) => (columns ? columns : '1')}fr)
  );
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  justify-content: center;

  ${({ mobileColumns, theme }) => theme.mediaWidth.upToExtraSmall`
  display:grid;
  grid-template-columns: repeat(${mobileColumns ? mobileColumns : '1'}, minmax(0, ${
    mobileColumns ? mobileColumns : '1'
  }fr));
  grid-column-gap: 0.5rem;
  grid-row-gap: 0.5rem;
  `};
`

export const ReverseGrid = styled(Grid)`
  direction: rtl;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    direction: ltr;
  `};
`

export const GridBlock = styled.div<{ maxWidth?: string; textAlign?: string; mobileAlign?: string }>`
  display: block;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
  margin: 0 auto;
  padding: 0.5rem 0;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '300px')};
  ${({ mobileAlign, theme }) => theme.mediaWidth.upToExtraSmall`
    text-align: ${mobileAlign ? mobileAlign : 'center'};
    padding: 1.5rem 0;
  `};
`

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
