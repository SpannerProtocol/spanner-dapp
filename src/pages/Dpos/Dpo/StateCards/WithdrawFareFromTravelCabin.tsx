import Balance from 'components/Balance'
import Divider from 'components/Divider'
import { SText } from 'components/Text'
import TxFee from 'components/TxFee'
import { SpacedSection } from 'components/Wrapper'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import ActionRow from 'components/Actions/ActionRow'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-api/types'
import { DpoAction } from 'utils/getDpoActions'
import { ACTION_ICONS } from '../../../../constants'

/**
 * When the default target is available
 */
export default function WithdrawFareFromTravelCabin({
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
  const targetCabin = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const inventoryIndex = useDpoTravelCabinInventoryIndex(dpoInfo.index.toString(), targetCabin?.index.toString())
  return (
    <>
      {inventoryIndex && (
        <ActionRow
          dpoInfo={dpoInfo}
          selectedState={selectedState}
          actionName={t(`Withdraw Ticket Fare`)}
          tip={t(`Withdraw Ticket Fare from Target TravelCabin.`)}
          buttonText={t(`Withdraw`)}
          icon={ACTION_ICONS[dpoAction.action]}
          transaction={{
            section: 'bulletTrain',
            method: 'withdrawFareFromTravelCabin',
            params: {
              travelCabinIdx: dpoInfo.target.asTravelCabin.toString(),
              travelCabinNumber: inventoryIndex.toString(),
            },
          }}
          txContent={
            <>
              {targetCabin && (
                <SpacedSection>
                  <SText>
                    {`${t(`Confirm Withdraw Ticket Fare from TravelCabin`)}: ${targetCabin.name.toString()}`}
                  </SText>
                </SpacedSection>
              )}
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
      )}
    </>
  )
}
