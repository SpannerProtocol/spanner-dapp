import styled from 'styled-components'
import { Text } from 'rebass'

export const ModalTitle = styled.span`
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`

export const HeavyText = styled.div<{ fontSize?: string; fontWeight?: string; color?: string }>`
  width: 100%;
  color: ${({ color, theme }) => (color ? color : theme.text2)};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '16px')}
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '700')};
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
  font-size: 24px;
  font-weight: 500;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
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

export const StandardText = styled.div<{ fontSize?: string; color?: string; fontWeight?: string }>`
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '500')};
  color: ${({ color, theme }) => (color ? color : theme.text2)};
  overflow-wrap: break-word;
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

export const DataTokenName = styled.div<{ color?: string }>`
  display: inline;
  font-size: 14px;
  font-weight: 700;
  color: ${({ color }) => (color ? color : '#000')};
  overflow-wrap: break-word;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
 `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `};
`
export const SectionTitle = styled.h3`
  font-weight: 700;
  margin-top: 0.45rem;
  margin-bottom: 0.45rem;
`

export default Text
