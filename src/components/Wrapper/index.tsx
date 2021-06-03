import styled from 'styled-components'
import AutoColumn from '../Column'

export const Wrapper = styled.div<{ maxWidth?: string }>`
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '960px')};
  margin: auto;
`

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

export const SpacedSection = styled(AutoColumn)<{ margin?: string; mobileMargin?: string }>`
  margin: ${({ margin }) => (margin ? margin : '1rem 0')};

  ${({ mobileMargin, theme }) => theme.mediaWidth.upToExtraSmall`
  margin: ${mobileMargin ? mobileMargin : '0.5rem 0'};
  `};
`

export const PaddedSection = styled(AutoColumn)`
  display: block;
  padding: 2rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `};
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

export const IconWrapper = styled.div<{ padding?: string; margin?: string; background?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ padding }) => (padding ? padding : '0.2rem')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  background: ${({ background }) => (background ? background : 'transparent')};
  cursor: pointer;

  :hover,
  :focus {
    opacity: 0.7;
  }
`

export const SectionDarkBg = styled.div<{ backgroundColor?: string }>`
  width: 100%;
  background: ${({ backgroundColor, theme }) => (backgroundColor ? backgroundColor : theme.bg2)};
  z-index: -1;
`

export const SectionImageBg = styled.div<{ height?: string; url?: string }>`
  width: 100%;
  height: ${({ height }) => (height ? height : '600px')};
  background: ${({ url }) => (url ? `transparent url(${url}) center center no-repeat padding-box;` : 'none')};
  opacity: 1;
`

export const ContentSection = styled.div<{
  paddingTop?: string
  paddingBottom?: string
}>`
  width: 100%;
  padding-top: ${({ paddingTop }) => (paddingTop ? paddingTop : '2rem')};
  padding-bottom: ${({ paddingTop }) => (paddingTop ? paddingTop : '2rem')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-top: 1rem;
    padding-bottom: 1rem;
  `};
`

export const CenterWrapper = styled.div`
  text-align: center;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export const FlexWrapper = styled.div<{
  justifyContent?: string
  alignItems?: string
}>`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ justifyContent }) => (justifyContent ? justifyContent : 'center')};
  align-items: ${({ alignItems }) => (alignItems ? alignItems : 'center')};
  width: 100%;
`

export const ImageWrapper = styled.div<{
  justifyContent?: string
  alignItems?: string
  maxWidth?: string
  height?: string
}>`
  display: flex;
  justify-content: ${({ justifyContent }) => (justifyContent ? justifyContent : 'center')};
  align-items: ${({ alignItems }) => (alignItems ? alignItems : 'center')};
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '400px')};
  margin: auto;
  height: ${({ height }) => (height ? height : 'initial')};
`
