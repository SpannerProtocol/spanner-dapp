import Selector from 'components/Selector'
import { BorderedWrapper } from 'components/Wrapper'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import i18n from '../../i18n'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

const languages = [
  { code: 'en', language: 'English', native: 'English', file: 'en.json' },
  { code: 'zh', language: 'Chinese (Simplified)', native: '中文(简体)', file: 'zh.json' },
]

export default function LanguageSettings() {
  const theme = useContext(ThemeContext)
  // const [languageOptions, setLanguageOptions] = useState<Array<SelectorOption>>()
  const { t } = useTranslation()

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang)
  }, [])

  const languageOptions = useMemo(
    () =>
      languages.map((lang) => ({
        label: `${lang.native}`,
        callback: () => changeLanguage(lang.code),
      })),
    [changeLanguage]
  )

  const defaultOption = languageOptions.find((option) => option.label === `English`)

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed>
          <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
            {t(`Selected Language`)}
          </TYPE.black>
        </RowFixed>
        <RowBetween>
          <BorderedWrapper padding="0" marginTop="0" marginBottom="0">
            {languageOptions && defaultOption && (
              <Selector
                title={t(`Select a Language`)}
                options={languageOptions}
                defaultOption={defaultOption}
                selectedIconMaxWidth={'20px'}
                selectedIconMaxWidthMobile={'20px'}
              />
            )}
          </BorderedWrapper>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
