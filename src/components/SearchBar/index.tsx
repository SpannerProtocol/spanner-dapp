import styled from 'styled-components'
import { Dispatch, SetStateAction } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

const SearchWrapper = styled.div<{ backgroundColor: string | undefined; borderColor: string | undefined }>`
  display: inline-flex;
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : '#a0a5bd')};
  border-radius: 8px;
  border: 1px solid ${({ borderColor }) => (borderColor ? borderColor : '#e6ebf2')};
  padding: 0.5rem;
  margin: 0.5rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0.5rem;
 `};
`

const SearchInput = styled.input<{ textColor: string | undefined }>`
  border: 0;
  color: ${({ theme, textColor }) => (textColor ? textColor : theme.text3)};
  background-color: transparent;
  outline: none;
  width: 100%;
  padding-left: 15px;

  ::placeholder,
  ::-webkit-input-placeholder {
    color: ${({ theme, textColor }) => (textColor ? textColor : theme.text3)};
  }
  :-ms-input-placeholder {
    color: ${({ theme, textColor }) => (textColor ? textColor : theme.text3)};
  }
`
type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface SearchBarProps {
  keyword?: string
  setKeyword: Dispatcher<string>
  placeholder?: string
  inputType?: string
  iconColor?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

export default function SearchBar(props: SearchBarProps) {
  const { keyword, placeholder, iconColor, backgroundColor, borderColor, textColor, inputType, setKeyword } = props
  const { t } = useTranslation()
  return (
    <SearchWrapper backgroundColor={backgroundColor} borderColor={borderColor}>
      <FontAwesomeIcon icon={faSearch} style={{ color: iconColor ? iconColor : '#000' }} />
      <SearchInput
        value={keyword ? keyword : undefined}
        onChange={(e) => setKeyword(e.target.value)}
        type={inputType ? inputType : 'text'}
        textColor={textColor}
        placeholder={placeholder ? t(placeholder) : t(`Search`)}
      />
    </SearchWrapper>
  )
}
