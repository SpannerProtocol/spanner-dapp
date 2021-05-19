import Balance from 'components/Balance'
import { RowBetween } from 'components/Row'
import { StandardText } from 'components/Text'
import TxFee from 'components/TxFee'
import { BorderedWrapper, SpacedSection } from 'components/Wrapper'
import { useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import Action from 'pages/Item/actions'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function DpoBuyTravelCabinAvailable({ dpoInfo, dpoAction }: { dpoInfo: DpoInfo; dpoAction: DpoAction }) {
  const [estimatedFee, setEstimatedFee] = useState<string>()
  const { t } = useTranslation()
  const targetCabin = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  return (
    <Action
      txContent={
        <>
          <SpacedSection>
            <StandardText>{t(`Confirm purchase of TravelCabin.`)}</StandardText>
          </SpacedSection>
          {targetCabin && (
            <BorderedWrapper>
              <RowBetween>
                <StandardText>{t(`Travel Class`)}</StandardText>
                <StandardText>{targetCabin.name.toString()}</StandardText>
              </RowBetween>
            </BorderedWrapper>
          )}
          <Balance token={dpoInfo.token_id.asToken.toString()} />
          <TxFee fee={estimatedFee} />
        </>
      }
      actionName={t('Buy TravelCabin')}
      buttonText={t('Buy')}
      icon={ACTION_ICONS[dpoAction.action]}
      tip={t(`Use DPO's crowdfund to buy this TravelCabin.`)}
      transaction={{
        section: 'bulletTrain',
        method: 'dpoBuyTravelCabin',
        params: {
          buyerDpoIdx: dpoInfo.index.toString(),
          travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
        },
      }}
      setEstimatedFee={setEstimatedFee}
    />
  )
}
