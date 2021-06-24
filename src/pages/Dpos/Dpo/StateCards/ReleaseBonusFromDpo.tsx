import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween, RowFixed } from 'components/Row'
import { HeavyText, SText, TokenText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, CenterWrapper, SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import ActionPlate from 'components/Actions/ActionPlate'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { ThemeContext } from 'styled-components'
import { formatToUnit } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'
import { CheckCircle } from 'react-feather'
/**
 * When the default target is available
 */
export default function ReleaseBonusFromDpo({
  dpoInfo,
  dpoAction,
  isLast,
  selectedState,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  selectedState?: string
  isLast: boolean
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()
  const theme = useContext(ThemeContext)

  return (
    <ActionPlate
      dpoInfo={dpoInfo}
      selectedState={selectedState}
      actionName={t('Release Bonus Reward')}
      actionDesc={
        <>
          <RowFixed>
            <BorderedWrapper margin="0.25rem">
              <CenterWrapper>
                <div style={{ display: 'block', paddingRight: '0.5rem' }}>
                  <RowFixed align="baseline" justifyContent="center">
                    <HeavyText mobileFontSize="12px" color={theme.green1}>
                      {`${formatToUnit(dpoInfo.total_bonus_received.toBn(), chainDecimals)} `}
                    </HeavyText>
                    <TokenText color={theme.green1} fontSize="10px" mobileFontSize="8px" padding="0 0.25rem">
                      {dpoInfo.token_id.asToken.toString()}
                    </TokenText>
                  </RowFixed>
                  <SText
                    width="100%"
                    textAlign="center"
                    fontSize="12px"
                    mobileFontSize="10px"
                    style={{ paddingRight: '0.25rem' }}
                  >
                    {t(`Bonus Received`).toUpperCase()}
                  </SText>
                </div>
                {!dpoInfo.total_bonus_received.isZero() && dpoInfo.vault_bonus.isZero() && (
                  <>
                    <RowFixed width="fit-content" padding="0 0.5rem">
                      <CheckCircle size={24} color={theme.green1} />
                    </RowFixed>
                    <SText
                      width="fit-content"
                      textAlign="center"
                      fontSize="12px"
                      mobileFontSize="10px"
                      style={{ paddingRight: '0.25rem' }}
                    >
                      {t(`Released`).toUpperCase()}
                    </SText>
                  </>
                )}
              </CenterWrapper>
            </BorderedWrapper>
          </RowFixed>
        </>
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
            <SText width="100%">{t(`Release Bonus Rewards to DPO Members`)}</SText>
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
      disableButton={!dpoInfo.total_bonus_received.isZero() && dpoInfo.vault_bonus.isZero()}
    />
  )
}
