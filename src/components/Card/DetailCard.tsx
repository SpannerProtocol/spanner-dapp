import Card, { DetailGridCard } from 'components/Card'
import Divider from 'components/Divider'
import { RowFixed } from 'components/Row'
import { HeavyText } from 'components/Text'
import { CenterWrapper, ClickableSection, SpacedSection } from 'components/Wrapper'
import React, { useContext, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'

interface DetailCardProps {
  children: React.ReactNode
  details?: JSX.Element
  smallDetails?: boolean
  padding?: string
  margin?: string
  mobileMargin?: string
  defaultShow?: boolean
}

function Details({
  show,
  onClick,
  smallDetails,
  isSimple,
}: {
  show: boolean
  onClick: () => void
  smallDetails?: boolean
  isSimple?: boolean
}) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <>
      {isSimple ? (
        <ClickableSection onClick={onClick}>
          <CenterWrapper style={{ height: '100%' }}>
            {show ? (
              <ChevronUp color={theme.primary1} size={smallDetails ? 12 : 16} strokeWidth={'2px'} />
            ) : (
              <ChevronDown color={theme.primary1} size={smallDetails ? 12 : 16} strokeWidth={'2px'} />
            )}
          </CenterWrapper>
        </ClickableSection>
      ) : (
        <>
          <Divider margin={'0.5rem 0'} />
          <ClickableSection onClick={onClick}>
            <CenterWrapper>
              {show ? (
                <RowFixed width="fit-content">
                  <HeavyText
                    fontSize={smallDetails ? '12px' : '16px'}
                    mobileFontSize={smallDetails ? '10px' : '14px'}
                    color={theme.primary1}
                    width="fit-content"
                    padding={smallDetails ? '0 0.25rem' : '0.25rem 0.5rem'}
                  >
                    {t(`Hide`)}
                  </HeavyText>
                  <ChevronUp color={theme.primary1} size={smallDetails ? 12 : 16} strokeWidth={'2px'} />
                </RowFixed>
              ) : (
                <RowFixed width="fit-content" justifyContent="bottom">
                  <HeavyText
                    fontSize={smallDetails ? '12px' : '16px'}
                    mobileFontSize={smallDetails ? '10px' : '14px'}
                    color={theme.primary1}
                    width="fit-content"
                    padding={smallDetails ? '0 0.25rem' : '0.25rem 0.5rem'}
                  >
                    {t(`Details`)}
                  </HeavyText>
                  <ChevronDown color={theme.primary1} size={smallDetails ? 12 : 16} strokeWidth={'2px'} />
                </RowFixed>
              )}
            </CenterWrapper>
          </ClickableSection>
        </>
      )}
    </>
  )
}

export default function DetailCard({ children, details, smallDetails, padding, margin }: DetailCardProps) {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <>
      <Card padding={padding} margin={margin}>
        {children}
        {showDetails && (
          <>
            <SpacedSection>{details}</SpacedSection>
          </>
        )}
        {details && (
          <Details show={showDetails} onClick={() => setShowDetails(!showDetails)} smallDetails={smallDetails} />
        )}
      </Card>
    </>
  )
}

export function DetailCardSimple({
  children,
  details,
  smallDetails,
  padding,
  defaultShow,
  margin,
  mobileMargin,
}: DetailCardProps) {
  const [showDetails, setShowDetails] = useState<boolean>(defaultShow ? defaultShow : false)

  return (
    <>
      <Card
        padding={padding}
        margin={margin ? margin : '0 0 1rem 0'}
        mobileMargin={mobileMargin ? mobileMargin : '0 0 0.5rem 0'}
      >
        <DetailGridCard>
          {children}
          {details && (
            <Details
              isSimple
              show={showDetails}
              onClick={() => setShowDetails(!showDetails)}
              smallDetails={smallDetails}
            />
          )}
        </DetailGridCard>
        {showDetails && <>{details}</>}
      </Card>
    </>
  )
}
