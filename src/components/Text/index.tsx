import styled from 'styled-components'
import { Text } from 'rebass'

export const ModalTitle = styled.span`
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`

export const HeavyText = styled.div<{
  fontSize?: string
  fontWeight?: string
  color?: string
  mobileFontSize?: string
}>`
  width: fit-content;
  color: ${({ color, theme }) => (color ? color : theme.text2)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '16px')}
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '700')};
  margin: 0;
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '12px'}
`};
`

export const ModalText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`

export const ImportantTextPrimary = styled.div`
  width: 100%;
  font-size: 30px;
  font-weight: 600;
  color: #D3459C
  text-align: center;
`
export const DataWrapper = styled.div`
  display: inline;
  width: 100%;
  align-items: center; /** Y-axis align **/
  justify-content: left; /** X-axis align **
`
export const DataField = styled.div`
  display: inline-block;
  color: #9a99a2;
  margin: 0;
  width: 50%;
  font-size: clamp(15px, 2.5vw, 18px);
`

export const DataValue = styled.div`
  display: inline-block;
  color: #9a99a2;
  font-weight: 600;
  margin: 0;
  width: 50%;
  font-size: clamp(15px, 2.5vw, 18px);
  text-align: right;
`

export const DisclaimerText = styled(Text)`
  color: #9a99a2;
  font-size: 10px;
  text-align: center;
  font-style: italic;
`

export const Heading = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
 `};
`

export const SectionHeading = styled.h3`
  margin-top: 0rem;
  margin-bottom: 1rem;
  font-size: 17px;
  font-weight: bold;
  text-align: left;
  color: ${({ theme }) => theme.text2};
`

export const LightText = styled.div`
  color: ${({ theme }) => theme.text4};
  font-weight: 400;
  font-size: 14px;
`

export const StandardText = styled.div<{
  fontSize?: string
  color?: string
  fontWeight?: string
  paddingLeft?: string
  padding?: string
  width?: string
  mobileFontSize?: string
}>`
  width: ${({ width }) => (width ? width : 'fit-content')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '400')};
  color: ${({ color, theme }) => (color ? color : theme.text2)};
  padding: ${({ padding }) => (padding ? padding : '0')}
  word-break: break-word;
  align-items: center;

  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '11px'};
 `};
`

export const ItalicText = styled(StandardText)`
  font-style: italic;
`

export const SmallText = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text2};
  overflow-wrap: break-word;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: 11px;
 `};
`

export const DataTokenName = styled.div<{ color?: string; fontSize?: string; mobileFontSize?: string }>`
  display: inline;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')}
  font-weight: 700;
  color: ${({ color, theme }) => (color ? color : theme.text3)};
  overflow-wrap: break-word;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
 `};

  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '10px'}
  `};
`
export const SectionTitle = styled.h3`
  font-weight: 700;
  margin-top: 0.45rem;
  margin-bottom: 0.45rem;
`

export const ErrorMsg = styled.div<{
  borderColor?: string
  background?: string
  padding?: string
  marginTop?: string
  marginBottom?: string
  fontSize?: string
  mobileFontSize?: string
}>`
  display: block;
  align-items: center;
  width: 100%;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')}
  width: 100%;
  margin-top: ${({ marginTop }) => (marginTop ? marginTop : '0')};
  margin-bottom: ${({ marginBottom }) => (marginBottom ? marginBottom : '0')};
  color: ${({ color, theme }) => (color ? color : theme.white)};
  background: ${({ background, theme }) => (background ? background : theme.red2)};
  border: 1px solid ${({ borderColor, theme }) => (borderColor ? borderColor : theme.red2)};
  border-radius: 8px;
  padding: ${({ padding }) => (padding ? padding : '1rem')};
  word-break: break-word;
  ${({ padding, mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    padding: ${padding ? padding : '0.4rem'};
    font-size: ${mobileFontSize ? mobileFontSize : '12px'}
  `};
`

export const WarningMsg = styled(ErrorMsg)`
  background: ${({ background, theme }) => (background ? background : theme.primary4)};
`

export default Text
