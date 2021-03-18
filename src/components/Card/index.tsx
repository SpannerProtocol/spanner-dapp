import React from 'react'
import styled from 'styled-components'
import { CardProps, Text } from 'rebass'
import { Box } from 'rebass/styled-components'

// Normal Card with surrounding shadows
const Card = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
  box-shadow: 0 2px 22px 0 rgba(15, 89, 209, 0.12), 0 2px 19px 0 rgba(82, 105, 141, 0.12);
  -webkit-box-shadow: 0 2px 22px 0 rgba(15, 89, 209, 0.12), 0 2px 19px 0 rgba(82, 105, 141, 0.12);
  border-radius: 8px;
  padding: 1.25rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export const FlexCardBox = styled(Card)`
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.6rem;
  `};
`

export const FlatCard = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
  border-radius: 8px;
  width: 100%;
  color: ${({ theme }) => theme.primary1};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  margin-top: 0.8rem;
  margin-bottom: 0.8rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    max-width: 1600px;
    padding-left: 0.35rem;
    padding-right: 0.35rem;
  `};
`

export const FlatCardSection = styled(Card)<{ margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  margin: ${({ margin }) => (margin ? margin : '0 0 1rem 0')};
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  width: 100%;
`

// Normal Card with surrounding shadows
export const FlatCardPlate = styled(FlatCardSection)<{ margin?: string; padding?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  margin: ${({ margin }) => (margin ? margin : '0 0 1rem 0')};
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  width: 100%;
  ${({ padding, theme }) => theme.mediaWidth.upToMedium`
  padding: ${padding ? padding : '0.5rem'};
`};
`

// Normal Card with surrounding shadows
export const ThinShadowCard = styled(Card)<{ background?: string; maxWidth?: string; margin?: string }>`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 1rem;
  width: 100%;
  text-align: center;
  background: ${({ background }) => (background ? background : '#fff')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '360px')};
  margin: ${({ margin }) => (margin ? margin : '0')};
`

export default Card

export const TableCard = styled(Card)`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(15, 89, 209, 0.08);
  padding: 0;
`

export const LightCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg3};
`

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg3};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow2};
  font-weight: 500;
`

export const PinkCard = styled(Card)`
  background-color: rgba(255, 0, 122, 0.03);
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
`

const BlueCardStyled = styled(Card)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primary1};
  border-radius: 12px;
  width: fit-content;
`

export const BlueCard = ({ children, ...rest }: CardProps) => {
  return (
    <BlueCardStyled {...rest}>
      <Text fontWeight={500} color="#2172E5">
        {children}
      </Text>
    </BlueCardStyled>
  )
}

export const PinkGradientCard = styled.div`
  background: linear-gradient(148.21deg, #fe11a3 6.77%, #520a74 100%);
  box-shadow: 7px 7px 6px 1px rgba(193, 1, 255, 0.22);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.02, 0.01, 0.47, 1);
  color: #fff;

  &:hover {
    box-shadow: 0 15px 15px rgba(193, 1, 255, 0.22);
    transform: translate(0, -5px);
  }
`

export const GreenGradientCard = styled.div`
  background: linear-gradient(148.21deg, #39ffbc 9.38%, #0737de 100%);
  box-shadow: 7px 7px 6px 1px rgba(58, 255, 189, 0.23);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.02, 0.01, 0.47, 1);

  &:hover {
    box-shadow: 0 15px 15px rgba(193, 1, 255, 0.22);
    transform: translate(0, -5px);
  }
`

export const PinkFillCard = styled.div`
  color: #000;
  border: double 1.5px transparent;
  background-image: linear-gradient(white, white), linear-gradient(148.21deg, #fe11a3 6.77%, #520a74 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 7px 7px 6px 1px rgba(193, 1, 255, 0.22);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.02, 0.01, 0.47, 1);

  &:hover {
    color: #fff;
    border: 2.5px transparent;
    background: linear-gradient(148.21deg, #fe11a3 6.77%, #520a74 100%);
    box-shadow: 0 15px 15px rgba(193, 1, 255, 0.22);
    transform: translate(0, -5px);
  }

  @media only screen and (max-width: 615px) {
    background: linear-gradient(148.21deg, #fe11a3 6.77%, #520a74 100%);
    box-shadow: 7px 7px 6px 1px rgba(193, 1, 255, 0.22);
    border-radius: 18px;
    border: 2.5px transparent;
    color: #fff;
  }
`
