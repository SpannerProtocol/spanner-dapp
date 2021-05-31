import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import Action from 'pages/Item/actions'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { formatToUnit } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function ReleaseBonusFromDpo({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  return (
    <Action
      txContent={
        <>
          <SText>{t(`Release Bonus Rewards`)}</SText>
          <BorderedWrapper>
            <RowBetween>
              <SText>{t(`Bonus`)}</SText>
              <SText>{formatToUnit(dpoInfo.vault_bonus.toBn(), chainDecimals)}</SText>
            </RowBetween>
          </BorderedWrapper>
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Release Bonus Reward')}
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
      setEstimatedFee={setEstimatedFee}
    />
  )
}
