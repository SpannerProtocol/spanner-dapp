import { StorageKey } from '@polkadot/types'
import { AlertIcon, AlertWrapper } from 'components/Alert'
import { ButtonPrimary } from 'components/Button'
import { FlatCardPlate } from 'components/Card'
import { RowBetween } from 'components/Row'
import { SectionHeading, StandardText } from 'components/Text'
import { Section } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoIndex, DpoInfo } from 'spanner-interfaces'
import getApy from 'utils/getApy'
import { DpoAction } from 'utils/getDpoActions'
import CommitToTargetIcon from '../../assets/svg/icon-commit-to-target.svg'
import ReleaseTokenIcon from '../../assets/svg/icon-release-token.svg'
import VaultIcon from '../../assets/svg/icon-vault.svg'
import WithdrawFromTargetIcon from '../../assets/svg/icon-withdraw-from-target.svg'
import { formatToUnit } from '../../utils/formatUnit'

type Dispatcher<S> = Dispatch<SetStateAction<S>>

interface DpoCard {
  item: [DpoIndex | StorageKey, DpoInfo]
  chainDecimals: number
  token: string
  onClick: Dispatcher<any>
}

function CardContent(props: DpoCard) {
  const { item, chainDecimals, token, onClick } = props
  const [storageKey, dpoInfo] = item
  const { expectedBlockTime } = useBlockManager()
  const { t } = useTranslation()

  return (
    <>
      <div style={{ overflow: 'hidden' }}>
        <Section>
          <SectionHeading style={{ marginLeft: '0', marginTop: '0' }}>{dpoInfo.name.toString()}</SectionHeading>
        </Section>
        <Section>
          <RowBetween>
            <StandardText>{t(`Crowdfund Target`)}</StandardText>
            <StandardText>
              {formatToUnit(dpoInfo.target_amount.toBn(), chainDecimals, 2)} {token}
            </StandardText>
          </RowBetween>
        </Section>
        <Section>
          {expectedBlockTime && (
            <RowBetween>
              <StandardText>{t(`Yield (APY)`)}</StandardText>
              <StandardText>
                {`${getApy({
                  totalYield: dpoInfo.target_yield_estimate.toBn(),
                  totalDeposit: dpoInfo.target_amount.toBn(),
                  chainDecimals: chainDecimals,
                  blocksInPeriod: expectedBlockTime,
                  period: dpoInfo.target_maturity,
                }).toString()} %`}
              </StandardText>
            </RowBetween>
          )}
          <RowBetween>
            <StandardText>{t(`Commission Fee`)}</StandardText>
            <StandardText>{dpoInfo.commission_rate.toNumber() / 10}%</StandardText>
          </RowBetween>
          <RowBetween>
            <StandardText>{t(`Seat Value`)}</StandardText>
            <StandardText>
              {formatToUnit(dpoInfo.amount_per_seat.toBn(), chainDecimals, 2)} {token}
            </StandardText>
          </RowBetween>
          <RowBetween>
            <StandardText>{t(`Available Seats`)}</StandardText>
            <StandardText>{dpoInfo.empty_seats.toString()} Seats</StandardText>
          </RowBetween>
        </Section>
        <Section>
          <Link to={{ pathname: `/item/dpo/${dpoInfo.index.toString()}` }} style={{ textDecoration: 'none' }}>
            <ButtonPrimary
              onClick={() => onClick([storageKey, dpoInfo])}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '1rem' }}
            >
              {t(`Learn More`)}
            </ButtonPrimary>
          </Link>
        </Section>
      </div>
    </>
  )
}

export default function DpoCard(props: DpoCard) {
  const { item, chainDecimals, token, onClick } = props

  return (
    <FlatCardPlate>
      <CardContent item={item} chainDecimals={chainDecimals} token={token} onClick={onClick} />
    </FlatCardPlate>
  )
}

interface ProfileCard {
  item: [DpoIndex | StorageKey, DpoInfo]
  chainDecimals: number
  token: string
  alerts?: Array<DpoAction | undefined>
  onClick: Dispatcher<any>
}

const actionIcons: { [index: string]: string } = {
  withdrawFareFromTravelCabin: WithdrawFromTargetIcon,
  withdrawYieldFromTravelCabin: VaultIcon,
  dpoBuyTravelCabin: CommitToTargetIcon,
  dpoBuyDpoSeats: CommitToTargetIcon,
  releaseFareFromDpo: WithdrawFromTargetIcon,
  releasePeriodicDropFromDpo: ReleaseTokenIcon,
  releaseInstantDropFromDpo: ReleaseTokenIcon,
}

function ProfileCardContent(props: ProfileCard) {
  const { item, chainDecimals, token, alerts, onClick } = props
  const [storageKey, dpoInfo] = item
  const { t } = useTranslation()
  return (
    <>
      <Section>
        <RowBetween>
          <SectionHeading style={{ marginLeft: '0', marginTop: '0' }}>{dpoInfo.name.toString()}</SectionHeading>
          <div style={{ display: 'flex' }}>
            {alerts &&
              alerts.length > 0 &&
              alerts.map((alert, index) => {
                if (!alert || !alert.action) return <></>
                return (
                  <div key={index}>
                    <Link to={{ pathname: `/item/dpo/${dpoInfo.index.toString()}` }} style={{ textDecoration: 'none' }}>
                      <AlertWrapper onClick={() => onClick([storageKey, dpoInfo])}>
                        <AlertIcon src={actionIcons[alert.action]} />
                      </AlertWrapper>
                    </Link>
                  </div>
                )
              })}
          </div>
        </RowBetween>
      </Section>
      <Section>
        <RowBetween>
          <StandardText>{t(`Crowdfund Target`)}</StandardText>
          <StandardText>
            {formatToUnit(dpoInfo.target_amount.toBn(), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
      </Section>
      <Section>
        <RowBetween>
          <StandardText>{t(`Commission Fee`)}</StandardText>
          <StandardText>{dpoInfo.commission_rate.toNumber() / 10}%</StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Seat Value`)}</StandardText>
          <StandardText>
            {formatToUnit(dpoInfo.amount_per_seat.toBn(), chainDecimals, 2)} {token}
          </StandardText>
        </RowBetween>
        <RowBetween>
          <StandardText>{t(`Available Seats`)}</StandardText>
          <StandardText>{dpoInfo.empty_seats.toString()} Seats</StandardText>
        </RowBetween>
      </Section>
      <Section>
        <Link to={{ pathname: `/item/dpo/${dpoInfo.index.toString()}` }} style={{ textDecoration: 'none' }}>
          <ButtonPrimary
            onClick={() => onClick([storageKey, dpoInfo])}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '1rem' }}
          >
            {t(`Learn More`)}
          </ButtonPrimary>
        </Link>
      </Section>
    </>
  )
}

export function DpoProfileCard(props: ProfileCard) {
  const { item, chainDecimals, token, alerts, onClick } = props
  return (
    <FlatCardPlate>
      <ProfileCardContent item={item} chainDecimals={chainDecimals} token={token} alerts={alerts} onClick={onClick} />
    </FlatCardPlate>
  )
}
