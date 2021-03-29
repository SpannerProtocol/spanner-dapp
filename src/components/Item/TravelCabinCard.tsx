import { StorageKey } from '@polkadot/types'
import { ButtonPrimary } from 'components/Button'
import { FlatCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { Section } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TravelCabinIndex, TravelCabinInfo } from 'spanner-interfaces'
import { blockToDays } from 'utils/formatBlocks'
import getApy from 'utils/getApy'
import getCabinClass, { getCabinClassImage } from 'utils/getCabinClass'
import { formatToUnit } from '../../utils/formatUnit'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface TravelCabinCard {
  item: [TravelCabinIndex | StorageKey, TravelCabinInfo]
  chainDecimals: number
  token: string
  onClick: Dispatcher<any>
}

export default function TravelCabinCard(props: TravelCabinCard) {
  const { item, chainDecimals, token, onClick } = props
  const [storageKey, travelCabinInfo] = item
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  return (
    <FlatCard>
      <Section>
        <SectionHeading style={{ marginLeft: '0', marginTop: '0', display: 'inline-flex' }}>
          {t(`TravelCabin `)}
          {getCabinClass(travelCabinInfo.index.toString())}
          {getCabinClassImage(travelCabinInfo.index.toString())}
        </SectionHeading>
      </Section>
      <Section>
        <RowBetween>
          <StandardText>{t(`Ticket Fare`)}</StandardText>
          <StandardText>
            {formatToUnit(travelCabinInfo.deposit_amount.toBn(), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
        {expectedBlockTime && (
          <RowBetween>
            <StandardText>{t(`Ride Duration`)}</StandardText>
            <StandardText>{blockToDays(expectedBlockTime, travelCabinInfo.maturity)} Days</StandardText>
          </RowBetween>
        )}
        <RowBetween>
          <StandardText>{t(`Yield Reward (APY)`)}</StandardText>
          <StandardText>
            {expectedBlockTime && (
              <>
                {`${getApy({
                  totalYield: travelCabinInfo.yield_total.toBn(),
                  totalDeposit: travelCabinInfo.deposit_amount.toBn(),
                  chainDecimals: chainDecimals,
                  blocksInPeriod: expectedBlockTime,
                  period: travelCabinInfo.maturity,
                }).toString()} %`}
              </>
            )}
          </StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Bonus Reward`)}</StandardText>
          <StandardText>
            {formatToUnit(travelCabinInfo.bonus_total.toBn(), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
      </Section>
      <Section>
        <Link to={`/item/travelcabin/${travelCabinInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
          <ButtonPrimary
            onClick={() => onClick([storageKey, travelCabinInfo])}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '1rem' }}
          >
            {t(`Learn More`)}
          </ButtonPrimary>
        </Link>
      </Section>
    </FlatCard>
  )
}
