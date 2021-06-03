import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Assets/actions'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function ReleaseBonusFromDpo({
  dpoInfo,
  dpoAction,
  isLast,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const theme = useContext(ThemeContext)

  return (
    <Action
      actionName={t('Release Bonus Reward')}
      actionDesc={
        <RowFixed>
          <SText width="fit-content" fontSize="10px" mobileFontSize="10px" style={{ paddingRight: '0.25rem' }}>
            {t(`Bonus`)}:
          </SText>
          <HeavyText width="fit-content" mobileFontSize="10px" color={theme.green1}>
            {`${formatToUnit(dpoInfo.vault_bonus.toBn(), chainDecimals)} `}
            <TokenText color={theme.green1}>{dpoInfo.token_id.asToken.toString()}</TokenText>
          </HeavyText>
        </RowFixed>
      }
      tip={t(`Release Bonus Reward from Bonus Vault to Members of DPO.`)}
      buttonText={t('Release')}
      icon={ACTION_ICONS[dpoAction.action]}
      transaction={{
        section: 'bulletTrain',
        method: 'releaseBonusFromDpo',
        params: {
          dpoIdx: dpoInfo.index.toString(),
        },
      }}
      txContent={
        <>
          <SpacedSection>
            <SText width="100%">{t(`Release Bonus Rewards`)}</SText>
          </SpacedSection>
          <Divider />
          <SpacedSection>
            <RowBetween>
              <SText width="fit-content">{t(`Bonus`)}</SText>
              <SText width="fit-content">
                {formatToUnit(dpoInfo.vault_bonus.toBn(), chainDecimals)} {dpoInfo.token_id.asToken.toString()}
              </SText>
            </RowBetween>
          </SpacedSection>
          <Divider />
          <SpacedSection>
            <Balance token={dpoInfo.token_id.asToken.toString()} />
            <TxFee fee={estimatedFee} />
          </SpacedSection>
        </>
      }
      setEstimatedFee={setEstimatedFee}
      isLast={isLast}
    />
  )
}
