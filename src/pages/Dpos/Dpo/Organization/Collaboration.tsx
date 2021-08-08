import { useLazyQuery } from '@apollo/client'
import DpoIcon from 'assets/svg/icon-dpo.svg'
import Card from 'components/Card'
import { Icon } from 'components/Image'
import { SHashLink, SLink } from 'components/Link'
import { Pill } from 'components/Pill'
import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { Header2, SText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import eventsSMShort from 'queries/graphql/eventsSMShort'
import { EventsSMShort, EventsSMShortVariables } from 'queries/graphql/types/EventsSMShort'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { DpoInfo } from 'spanner-api/types'
import hexToString, { isPrefixedHex } from 'utils/hexToString'
import useTheme from 'utils/useTheme'
import { TRAVELCABIN_CLASSES } from '../../../../constants'

interface DPORelationship {
  dpoId: string
  targetId: string
  targetType: 'DPO' | 'TravelCabin' | 'Unknown Target'
  children: string[]
  dpos: string[]
}

interface DPORelationships {
  [key: string]: DPORelationship
}

function Dpo({ dpoIndex, allPaths, dpoInfo }: { dpoIndex: string; allPaths: DPORelationships; dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const dpo = useSubDpo(dpoIndex)
  const theme = useTheme()

  const isCurrentDpo = dpoInfo.index.eq(dpoIndex)
  const isLead = allPaths[dpoIndex].targetType === 'TravelCabin'
  return (
    <>
      {dpo ? (
        <div style={{ padding: '0 0 0 1rem' }}>
          <RowFixed width="fit-content">
            <Icon src={DpoIcon} padding="0 0.5rem" alt={`dpo icon`} />
            {isCurrentDpo ? (
              <RowFixed width="fit-content">
                <SText>{dpo.name.toString()}</SText>
                <Pill margin="0 0 0 0.5rem" padding="0.15rem 0.5rem" fontSize="12px" mobileFontSize="10px">
                  {t(`This DPO`)}
                </Pill>
              </RowFixed>
            ) : (
              <SLink to={`/dpos/dpo/${dpo.index.toString()}/organization`} colorIsBlue>
                {dpo.name.toString()}
              </SLink>
            )}
            {isLead && (
              <Pill
                margin="0 0 0 0.5rem"
                padding="0.15rem 0.5rem"
                fontSize="12px"
                mobileFontSize="10px"
                background={theme.red1}
              >
                {t(`Lead DPO`)}
              </Pill>
            )}
          </RowFixed>
          {allPaths[dpoIndex].children.map((childIndex) => (
            <Dpo key={`dpo-${childIndex}`} dpoIndex={childIndex} allPaths={allPaths} dpoInfo={dpoInfo} />
          ))}
        </div>
      ) : (
        <Skeleton height={20} count={1} style={{ margin: '0.5rem 0' }} />
      )}
    </>
  )
}

function Asset({ path, allPaths, dpoInfo }: { path: DPORelationship; allPaths: DPORelationships; dpoInfo: DpoInfo }) {
  const cabin = useSubTravelCabin(path.targetId)
  const buyerInventoryIndex = useDpoTravelCabinInventoryIndex(dpoInfo.index.toString(), cabin?.index.toString())
  const { t } = useTranslation()
  const theme = useTheme()

  const hasPurchased = buyerInventoryIndex ? true : false
  const token = dpoInfo.token_id.asToken.toString().toLowerCase()

  return (
    <>
      {cabin ? (
        <>
          <RowFixed>
            <Icon
              src={TRAVELCABIN_CLASSES[cabin.name.toString()].image}
              margin="0 0.5rem 0 0"
              size="36px"
              alt={`${TRAVELCABIN_CLASSES[cabin.name.toString()].name} cabin icon`}
            />
            {hasPurchased ? (
              <SLink
                to={`/assets/travelcabin/${cabin.index.toString()}/inventory/${buyerInventoryIndex?.toString()}`}
                colorIsBlue
              >{`${t(`TravelCabin`)}: ${cabin.name.toString()}`}</SLink>
            ) : (
              <SHashLink to={`/projects/${token}?asset=TravelCabin#${cabin.name.toString()}`} colorIsBlue>
                {t(`TravelCabin`)}: {cabin.name.toString()}
              </SHashLink>
            )}
            <Pill
              margin="0 0 0 0.5rem"
              padding="0.15rem 0.5rem"
              fontSize="12px"
              mobileFontSize="10px"
              background={theme.green1}
            >
              {t(`Crowdfund Target`)}
            </Pill>
          </RowFixed>
          <Dpo dpoIndex={path.dpoId} allPaths={allPaths} dpoInfo={dpoInfo} />
        </>
      ) : (
        <Skeleton height={20} count={1} style={{ margin: '0.5rem 0' }} />
      )}
    </>
  )
}

/**
 * {id: {
 *  dpoId: string
 *  targetType: string
 *  targetId: string
 *  children: string[]
 *  dpos: string[] <-- array with flattened dpoIds including self to search if current dpo is part of this tree
 * }}
 */

/**
 * Creates an object array where each element contains info and a list of their children.
 * To create a tree, we can start by looking for the root where the dpo target is an Asset (e.g. TravelCabin)
 * @param data EventsSMShort
 */
function Collaboration({ data, dpoInfo }: { data?: EventsSMShort; dpoInfo: DpoInfo }) {
  const [result, setResult] = useState<{ allPaths: DPORelationships; dpoPath: DPORelationship } | undefined>()
  const events = useMemo(() => data && data.events && data.events.nodes && data.events.nodes, [data])

  useEffect(() => {
    if (!events) return
    const paths: DPORelationships = {}
    events.forEach((event) => {
      if (!event) return
      if (!event.extrinsic) return
      // [signerAddr, newDpoId]
      const createdDpoId = JSON.parse(event.data)[1].toString()
      // eslint-disable-next-line
      const regex = /(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/
      const argsArray = event.extrinsic.args.split(regex)
      // [name, target, managerSeats, base, directReferralRate, expiryBlk, referrer ]
      const args = argsArray.map((e) => (isPrefixedHex(e) ? hexToString(e) : e))
      const target = JSON.parse(args[1])
      let targetId: string
      let targetType: 'DPO' | 'TravelCabin' | 'Unknown Target'
      if (Object.keys(target).includes('dpo')) {
        targetId = target['dpo'][0].toString()
        targetType = 'DPO'
      } else if (Object.keys(target).includes('travelCabin')) {
        targetId = target['travelCabin'].toString()
        targetType = 'TravelCabin'
      } else {
        targetId = ''
        targetType = 'Unknown Target'
      }
      // If the createdDpo is not in object then add it
      if (!Object.keys(paths).includes(createdDpoId)) {
        paths[createdDpoId] = {
          dpoId: createdDpoId,
          targetType,
          targetId,
          children: [],
          dpos: [createdDpoId],
        }
      }
    })

    events.forEach((event) => {
      if (!event) return
      if (!event.extrinsic) return
      // [signerAddr, newDpoId]
      const createdDpoId = JSON.parse(event.data)[1].toString()
      // eslint-disable-next-line
      const regex = /(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/
      const argsArray = event.extrinsic.args.split(regex)
      // [name, target, managerSeats, base, directReferralRate, expiryBlk, referrer ]
      const args = argsArray.map((e) => (isPrefixedHex(e) ? hexToString(e) : e))
      const target = JSON.parse(args[1])
      let targetId: string
      let targetType: 'DPO' | 'TravelCabin' | 'Unknown Target'
      if (Object.keys(target).includes('dpo')) {
        targetId = target['dpo'][0].toString()
        targetType = 'DPO'
      } else if (Object.keys(target).includes('travelCabin')) {
        targetId = target['travelCabin'].toString()
        targetType = 'TravelCabin'
      } else {
        targetId = ''
        targetType = 'Unknown Target'
      }
      // If the createdDpo's target is DPO and exists in object map, then add to children and search array
      if (targetType === 'DPO' && Object.keys(paths).includes(targetId)) {
        paths[targetId].children.push(createdDpoId)
        paths[targetId].dpos.push(createdDpoId)
      }
    })
    // Find the path starting at the root that this dpo belongs to
    Object.keys(paths).forEach((dpoId) => {
      if (paths[dpoId].targetType === 'TravelCabin' && paths[dpoId].dpos.includes(dpoInfo.index.toString())) {
        setResult({ allPaths: paths, dpoPath: paths[dpoId] })
      } else if (paths[dpoId].targetType === 'DPO' && paths[dpoId].dpos.includes(dpoInfo.index.toString())) {
        let targetPath: DPORelationship = paths[paths[dpoId].targetId]
        // Keep looping until we have the lead dpo/root
        while (targetPath.targetType !== 'TravelCabin') {
          if (targetPath.targetType === 'DPO') {
            targetPath = paths[targetPath.targetId]
          }
        }
        setResult({ allPaths: paths, dpoPath: targetPath })
      }
    })
  }, [events, dpoInfo])

  return (
    <>
      {result ? (
        <>
          <Asset path={result.dpoPath} allPaths={result.allPaths} dpoInfo={dpoInfo} />
        </>
      ) : (
        <Skeleton height={20} count={1} style={{ margin: '0.5rem 0' }} />
      )}
    </>
  )
}

export default function CollaborationCard({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const [loadTransaction, { data }] = useLazyQuery<EventsSMShort, EventsSMShortVariables>(eventsSMShort, {
    variables: {
      section: 'bulletTrain',
      method: 'CreatedDpo',
    },
  })

  useEffect(() => loadTransaction(), [loadTransaction])

  return (
    <ContentWrapper>
      <Card margin="0 0 1rem 0">
        <RowFixed>
          <Header2 width="fit-content">{t('Collaboration')}</Header2>
          <QuestionHelper
            size={12}
            backgroundColor={'transparent'}
            text={t(`All the DPOs that are collaborating to purchase the crowdfund target`)}
          />
        </RowFixed>
        <SpacedSection margin="1.5rem 0" mobileMargin="1.5rem 0">
          <Collaboration dpoInfo={dpoInfo} data={data} />
        </SpacedSection>
      </Card>
    </ContentWrapper>
  )
}
