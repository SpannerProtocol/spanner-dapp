import LanguageIcon from 'assets/svg/icon-language.svg'
import { Icon } from 'components/Image'
import { useCallback } from 'react'
import styled from 'styled-components'
import i18n from '../../i18n'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { LinkStyledButton } from '../../theme'

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  bottom: 5.75rem;
  right: 9.25rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  right: 4.25rem;
  `};
`

const MenuItem = styled(LinkStyledButton)`
  font-size: 15px;
  flex: 1;
  padding: 0.8rem 0.5rem;
  color: ${({ theme }) => theme.text2};

  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }

  > svg {
    margin-right: 8px;
  }
`

export default function LanguageSwitch() {
  const open = useModalOpen(ApplicationModal.LANGUAGE)
  const toggle = useToggleModal(ApplicationModal.LANGUAGE)

  const changeLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
      toggle()
    },
    [toggle]
  )

  return (
    <div style={{ padding: '0 0.5rem' }}>
      <Icon onClick={toggle} src={LanguageIcon} size="36px" mobileSize="36px" />
      {open && (
        <MenuFlyout>
          <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
          <MenuItem onClick={() => changeLanguage('zh')}>中文(简体)</MenuItem>
        </MenuFlyout>
      )}
    </div>
  )
}
