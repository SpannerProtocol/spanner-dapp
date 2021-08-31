import { DialogOverlay } from '@reach/dialog'
import '@reach/dialog/styles.css'
// import Circle from 'assets/svg/yellow-loader.svg'
import { HeavyText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import { useEffect, useState } from 'react'
import { animated } from 'react-spring'
import styled from 'styled-components'
// import { CustomLightSpinner } from 'theme/components'
import { useTranslation } from 'translate'
import { useChainState } from '../../state/connections/hooks'
import NetworkSelector from '../Network'
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

export default function GlobalMaintenanceSpinner({ children }: GlobalSpinnerProps) {
  const { chain } = useChainState()
  const [chainUpgradeModalOpen, setChainUpgradeModalOpen] = useState<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    const HAMMER_MAINTENANCE = process.env.REACT_APP_HAMMER_MAINTENANCE === 'true'
    const SPANNER_MAINTENANCE = process.env.REACT_APP_SPANNER_MAINTENANCE === 'true'
    setChainUpgradeModalOpen(false)
    if (chain && chain.chain === 'Spanner' && SPANNER_MAINTENANCE) {
      setChainUpgradeModalOpen(true)
    }
    if (chain && chain.chain === 'Hammer' && HAMMER_MAINTENANCE) {
      setChainUpgradeModalOpen(true)
    }
  }, [chain])

  const chainName = chain ? chain.chainName : ''

  return (
    <div className="loading-container">
      <div className="loading">
        {chainUpgradeModalOpen ? (
          <>
            <StyledDialogOverlay key={'GlobalMaintenanceSpinner'}>
              {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
              <div style={{ display: 'block', justifyContent: 'center', textAlign: 'center' }}>
                <>
                  {/*<CustomLightSpinner src={Circle} alt="loader" size={'45px'} />*/}
                  <SpacedSection>
                    <HeavyText fontSize="24px" mobileFontSize="20px" style={{ margin: 'auto' }}>
                      {t('Under maintenance')}
                    </HeavyText>
                  </SpacedSection>
                  <HeavyText fontSize="18px" mobileFontSize="16px" style={{ margin: 'auto' }}>
                    {t('Chain maintenance message', { chain: chainName })}
                  </HeavyText>
                  <div style={{ padding: '1rem 0rem 1rem 0rem' }}>
                    <NetworkSelector />
                  </div>
                </>
              </div>
            </StyledDialogOverlay>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
