import Card from 'components/Card'
import Divider from 'components/Divider'
import { RowFixed } from 'components/Row'
import { HeavyText } from 'components/Text'
import { ContentWrapper, ClickableSection, CenterWrapper, SpacedSection } from 'components/Wrapper'
import React, { useState, useContext } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'

interface SectionCardProps {
  children: React.ReactNode
  details?: JSX.Element
}

function Details({ show, onClick }: { show: boolean; onClick: () => void }) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <Divider margin="0.5rem 0" />
      <ClickableSection onClick={onClick}>
        <CenterWrapper>
          {show ? (
            <RowFixed width="fit-content">
              <HeavyText
                fontSize={'16px'}
                mobileFontSize={'14px'}
                color={theme.primary1}
                width="fit-content"
                padding="0.25rem 0.5rem"
              >
                {t(`Hide`)}
              </HeavyText>
              <ChevronUp color={theme.primary1} size={16} strokeWidth={'2px'} />
            </RowFixed>
          ) : (
            <RowFixed width="fit-content" justifyContent="bottom">
              <HeavyText
                fontSize={'16px'}
                mobileFontSize={'14px'}
                color={theme.primary1}
                width="fit-content"
                padding="0.25rem 0.5rem"
              >
                {t(`Details`)}
              </HeavyText>
              <ChevronDown color={theme.primary1} size={16} strokeWidth={'2px'} />
            </RowFixed>
          )}
        </CenterWrapper>
      </ClickableSection>
    </>
  )
}

export default function DetailCard({ children, details }: SectionCardProps) {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <>
      <ContentWrapper>
        <Card>
          {children}
          {showDetails && (
            <>
              <SpacedSection>{details}</SpacedSection>
            </>
          )}
          {details && <Details show={showDetails} onClick={() => setShowDetails(!showDetails)} />}
        </Card>
      </ContentWrapper>
    </>
  )
}
