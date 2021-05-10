import styled from 'styled-components'
import AutoColumn from '../Column'

export const PageWrapper = styled(AutoColumn)<{ maxWidth?: string }>`
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '640px')};
  width: 100%;
`

export const Section = styled(AutoColumn)`
  margin-top: 5px;
  margin-bottom: 5px;
`

export const InlineSection = styled.div`
  display: inline-flex;
`

export const SpacedSection = styled(AutoColumn)`
  margin-top: 1rem;
  margin-bottom: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  `};
`
export const PaddedSection = styled(AutoColumn)`
  display: block;
  padding: 2rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `};
`

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
`

export const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `};
`

export const SectionContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 0.5rem;
  `};
`

export const FlexWrapper = styled.div`
  position: relative;
  max-width: 100%;
  width: 100%;
  flex-wrap: wrap;
  display: inline-flex;
  justify-content: center;
`

export const ButtonWrapper = styled.div`
  width: 100%;
  max-width: clamp(200px, 80vw, 290px);
  align-items: center;
  justify-content: center;
`

export const CollapseWrapper = styled.div`
  margin: 0;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: block;
 `};
`

export const ModalWrapper = styled.div`
  padding: 1rem;
  width: 100%;
`

export const BorderedWrapper = styled.div<{
  borderColor?: string
  background?: string
  padding?: string
  marginTop?: string
  marginBottom?: string
}>`
  display: block;
  align-items: center;
  font-size: 0.9rem;
  width: 100%;
  margin-top: ${({ marginTop }) => (marginTop ? marginTop : '0.7rem')};
  margin-bottom:${({ marginBottom }) => (marginBottom ? marginBottom : '0.7rem')};
  color: ${({ color, theme }) => (color ? color : theme.text1)}
  background: ${({ background }) => (background ? background : 'transparent')}
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : '#e6ebf2')} !important;
  border-radius: 8px;
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  overflow-wrap: anywhere;
  ${({ padding, theme }) => theme.mediaWidth.upToSmall`
    padding: ${padding ? padding : '0.5rem'};
  `};
`

export const RoundWrapper = styled(BorderedWrapper)`
  border-radius: 14px;
  width: auto;
  margin: 0;
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')} !important;
`

export const MemberWrapper = styled(RoundWrapper)<{ borderColor?: string; background?: string }>`
  display: block;
  align-items: center;
  width: 100%;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  font-size: 11px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.text1)}
  background: ${({ background }) => (background ? background : 'transparent')}
  padding: 0.5rem;
  overflow-wrap: anywhere;
`

export const StateWrapper = styled(RoundWrapper)`
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  margin-right: 0.5rem;
  padding: 0.5rem;
  width: auto;
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'transparent')} !important;
`

export const TransferWrapper = styled.div<{ borderColor?: string; background?: string }>`
  display: block;
  align-items: center;
  font-size: 10px;
  width: fit-content;
  color: ${({ color, theme }) => (color ? color : theme.text3)}
  background: ${({ background, theme }) => (background ? background : theme.text5)}
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : 'none')} !important;
  border-radius: 8px;
  padding: 0.5rem;
  overflow-wrap: anywhere;
`

export const BorderedSelection = styled(BorderedWrapper)`
  cursor: pointer;
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1} !important;
  }
`

export const SmallResWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: inherit;
`};
`

export const GridWrapper = styled.div<{ columns?: string; mobileColumns?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => (columns ? columns : '1')}, minmax(0, 4fr));
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;

  ${({ mobileColumns, theme }) => theme.mediaWidth.upToExtraSmall`
  display:grid;
  grid-template-columns: repeat(${mobileColumns ? mobileColumns : '1'}, minmax(0, 4fr));
  grid-column-gap: 0.5rem;
  grid-row-gap: 0.5rem;
  `};
`

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  border-radius: 36px;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};

  :hover,
  :focus {
    opacity: 0.7;
  }
`
