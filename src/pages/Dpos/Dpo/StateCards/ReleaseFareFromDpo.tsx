import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { RowBetween } from 'components/Row'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useSubstrate } from 'hooks/useSubstrate'
import ActionRow from 'components/Actions/ActionRow'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { formatToUnit } from 'utils/formatUnit'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function ReleaseFareFromDpo({
  dpoInfo,
  dpoAction,
  isLast,
  selectedState,
}: {
  dpoInfo: DpoInfo
  dpoAction: DpoAction
  isLast: boolean
  selectedState?: string
}) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const { chainDecimals } = useSubstrate()

  return (
    <ActionRow
      dpoInfo={dpoInfo}
      selectedState={selectedState}
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
      txContent={
        <>
          <SpacedSection>
            <SText>
              {t(`Confirm Release Deposit from DPO`)}: {dpoInfo.name.toString()}
            </SText>
          </SpacedSection>
          <Divider />
          <SpacedSection>
            <RowBetween>
              <SText>{t(`Deposit`)}</SText>
              <SText>
                {formatToUnit(dpoInfo.vault_withdraw.toBn(), chainDecimals)} {dpoInfo.token_id.asToken.toString()}
              </SText>
            </RowBetween>
          </SpacedSection>
          <Divider />
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      setEstimatedFee={setEstimatedFee}
      isLast={isLast}
    />
  )
}
