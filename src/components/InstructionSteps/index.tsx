import Card from 'components/Card'
import styled from 'styled-components'

export const Step = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  background: ${({ background, theme }) => (background ? background : theme.primary1)};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
    font-size: 12px;
  `};
`

export const StepNumber = styled.div<{ size?: string; fontSize?: string }>`
  background: ${({ theme }) => theme.text4};
  color: #fff;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')}
  width: ${({ size }) => (size ? size : '25px')};
  height: ${({ size }) => (size ? size : '25px')};
  border-radius: 50%;
  display: flex; /* or inline-flex */
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
`
