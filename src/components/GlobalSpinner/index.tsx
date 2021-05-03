import { DialogOverlay } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Circle from 'assets/svg/yellow-loader.svg'
import { ButtonPrimary } from 'components/Button'
import { HeavyText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import React, { useCallback, useState } from 'react'
import { animated, useTransition } from 'react-spring'
import styled from 'styled-components'
import { CustomLightSpinner } from 'theme/components'
import { useTranslation } from 'translate'
import { Activity } from 'react-feather'
interface GlobalSpinnerProps {
  children: React.ReactNode
}

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 101;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.white};
  }
`

export default function GlobalApiSpinner({ children }: GlobalSpinnerProps) {
  const { loading, chain, needReconnect, reconnect } = useApi()
  const [reconnecting, setReconnecting] = useState<boolean>(false)
  const { t } = useTranslation()

  const fadeTransition = useTransition(loading, null, {
    config: { duration: 400 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const handleReconnect = useCallback(() => {
    setReconnecting(true)
    reconnect()
  }, [reconnect])

  return (
    <div className="loading-container">
      <div className="loading">
        {loading ? (
          <>
            {fadeTransition.map(
              ({ item, key, props }) =>
                item && (
                  <StyledDialogOverlay key={key} style={props}>
                    {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}

                    <div style={{ display: 'block', justifyContent: 'center', textAlign: 'center' }}>
                      {needReconnect ? (
                        <>
                          {reconnecting ? (
                            <>
                              <CustomLightSpinner src={Circle} alt="loader" size={'45px'} />
                              <SpacedSection>
                                <HeavyText fontSize="24px" mobileFontSize="20px" style={{ margin: 'auto' }}>
                                  {t(`Reconnecting`)}
                                </HeavyText>
                              </SpacedSection>
                            </>
                          ) : (
                            <>
                              <SpacedSection>
                                <HeavyText fontSize="24px" mobileFontSize="20px" style={{ margin: 'auto' }}>
                                  {t(`Connection lost`)}
                                </HeavyText>
                              </SpacedSection>
                              <ButtonPrimary onClick={handleReconnect}>
                                <div style={{ marginRight: '8px' }}>
                                  <Activity />
                                </div>
                                <HeavyText color="fff" fontSize="16px" mobileFontSize="14px">
                                  {t(`Reconnect`)}
                                </HeavyText>
                              </ButtonPrimary>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <CustomLightSpinner src={Circle} alt="loader" size={'45px'} />
                          <SpacedSection>
                            <HeavyText fontSize="24px" mobileFontSize="20px" style={{ margin: 'auto' }}>
                              {t(`Spanner Dapp`)}
                            </HeavyText>
                          </SpacedSection>
                          <HeavyText fontSize="18px" mobileFontSize="16px" style={{ margin: 'auto' }}>
                            {t(`Connecting to`)}: {chain}
                          </HeavyText>
                        </>
                      )}
                    </div>
                  </StyledDialogOverlay>
                )
            )}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
