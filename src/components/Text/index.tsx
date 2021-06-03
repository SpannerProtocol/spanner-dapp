import styled from 'styled-components'
import { Text } from 'rebass'

// p
const Base = styled.p<{
  fontSize?: string
  mobileFontSize?: string
  color?: string
  width?: string
  padding?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  width: ${({ width }) => (width ? width : '100%')};
  margin: 0;
  padding: ${({ padding }) => (padding ? padding : '0.1rem 0')};
  line-height: 1.5;
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '12px'};
  `};
`

export const SText = styled(Base)<{ fontWeight?: string }>`
  width: ${({ width }) => (width ? width : 'fit-content')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '400')};
  padding: ${({ padding }) => (padding ? padding : '0')};
`

export const ThinText = styled(Base)`
  font-weight: 300;
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${mobileFontSize ? mobileFontSize : '12px'};
`};
`

export const HeavyText = styled(Base)`
  width: ${({ width }) => (width ? width : 'fit-content')};
  font-weight: 700;
`

export const LightText = styled(Base)`
  font-weight: 400;
  color: ${({ theme }) => theme.text5};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '14px'};
`};
`

export const BigText = styled(Base)`
  font-weight: 900;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '45px')};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  line-height: 1;
`};
`

// H1 - H5
export const Header1 = styled.h1<{
  fontSize?: string
  mobileFontSize?: string
  color?: string
  width?: string
  padding?: string
  margin?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '48px')};
  font-weight: 900;
  width: ${({ width }) => (width ? width : '100%')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  margin: ${({ margin }) => (margin ? margin : '0')};
  padding: ${({ padding }) => (padding ? padding : '0')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${mobileFontSize ? mobileFontSize : '28px'};
`};
`

export const Header2 = styled.h2<{
  fontSize?: string
  color?: string
  width?: string
  padding?: string
  mobileFontSize?: string
  margin?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '30px')};
  font-weight: 900;
  width: ${({ width }) => (width ? width : '100%')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  padding: ${({ padding }) => (padding ? padding : '0')};
  margin: ${({ margin }) => (margin ? margin : '0')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '20px'};
`};
`

export const Header3 = styled.h3<{
  fontSize?: string
  mobileFontSize?: string
  color?: string
  width?: string
  padding?: string
  margin?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '30px')};
  font-weight: 700;
  width: ${({ width }) => (width ? width : '100%')};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  margin: ${({ margin }) => (margin ? margin : '0')};
  padding: ${({ padding }) => (padding ? padding : '0')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${mobileFontSize ? mobileFontSize : '16px'};
`};
`

export const Header4 = styled.h4<{
  fontSize?: string
  mobileFontSize?: string
  color?: string
  width?: string
  padding?: string
  margin?: string
}>`
  font-family: 'Lato', 'Roboto', 'sans-serif';
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '24px')};
  font-weight: 700;
  width: ${({ width }) => (width ? width : '100%')};
  margin: 1rem 0;
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  margin: ${({ margin }) => (margin ? margin : '0')};
  padding: ${({ padding }) => (padding ? padding : '0')};
  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: ${mobileFontSize ? mobileFontSize : '14px'};
`};
`

export const ModalTitle = styled.span`
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
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

export const SectionHeading = styled.h3<{ margin?: string }>`
  margin-top: 0rem;
  margin: ${({ margin }) => (margin ? margin : '0 0 1rem 0')}
  font-size: 17px;
  font-weight: bold;
  text-align: left;
  color: ${({ theme }) => theme.text2};
`

export const ItalicText = styled(SText)`
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

export const TokenText = styled.div<{
  color?: string
  fontSize?: string
  mobileFontSize?: string
  padding?: string
  fontWeight?: string
}>`
  display: inline;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '700')};
  color: ${({ color, theme }) => (color ? color : theme.text3)};
  overflow-wrap: break-word;
  padding: ${({ padding }) => (padding ? padding : '0')}
    ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
 `};

  ${({ mobileFontSize, theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${mobileFontSize ? mobileFontSize : '10px'}
  `};
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
