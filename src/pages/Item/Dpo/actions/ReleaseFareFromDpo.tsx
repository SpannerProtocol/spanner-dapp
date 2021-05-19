import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
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
export default function ReleaseFareFromDpo({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  return (
    <Action
      txContent={
        <>
          <SpacedSection>
            <StandardText>
              {t(`Confirm Release Deposit from DPO`)}: {dpoInfo.name.toString()}
            </StandardText>
          </SpacedSection>
          <BorderedWrapper>
            <RowBetween>
              <StandardText>{t(`Deposit`)}</StandardText>
              <StandardText>
                {formatToUnit(dpoInfo.vault_withdraw.toBn(), chainDecimals)} {dpoInfo.token_id.asToken.toString()}
              </StandardText>
            </RowBetween>
          </BorderedWrapper>
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Release Deposit')}
      tip={t(
        `Releasing Deposit will withdraw the deposit in this DPO's Deposit Vault and release it to all members. If target is TravelCabin, deposit is for Ticket Fare. If target is another DPO, deposit is for the DPO Seats.`
      )}
      icon={ACTION_ICONS[dpoAction.action]}
      buttonText={t('Release')}
      transaction={{
        section: 'bulletTrain',
        method: 'releaseFareFromDpo',
        params: { dpoIdx: dpoInfo.index.toString() },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
