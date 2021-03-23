import styled from 'styled-components'
import Card from '../../components/Card'

export const StatContainer = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  background: ${({ background }) => (background ? background : '#fff')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: 10px;
  font-weight: 400;
  padding: 0.75rem;
`};
`

export const StatDisplayGrid = styled.div<{ columns?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => (columns ? columns : '3')}, minmax(0, 4fr));
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  `};
`

export const StatValue = styled.div<{ small?: boolean }>`
  font-size: ${({ small }) => (small ? '20px' : '30px')};
  font-weight: 700;
  color: #fff;

  ${({ small, theme }) => theme.mediaWidth.upToMedium`
  font-size: ${small ? '18px' : '30px'};
`};

  ${({ small, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${small ? '12px' : '12px'};
`};
`

export const StatText = styled.div`
  color: #000;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: 10px;
  font-weight: 400;
`};
`

export const StatDisplayContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
`
