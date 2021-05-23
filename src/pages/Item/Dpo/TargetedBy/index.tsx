import { useQuery } from '@apollo/client'
import { Option } from '@polkadot/types'
import Circle from 'assets/svg/yellow-loader.svg'
import { FlatCard } from 'components/Card'
import { CircleProgress } from 'components/ProgressBar'
import { HeavyText, SectionHeading, StandardText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import { createdDpoAllArgsOnly } from 'queries/graphql/createdDpoAllArgsOnly'
import { CreatedDpoAllArgsOnly } from 'queries/graphql/types/CreatedDpoAllArgsOnly'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import { CustomLightSpinner } from 'theme/components'
import BN from 'bn.js'
import { blocksToCountDown } from 'utils/formatBlocks'
import { Link } from 'react-router-dom'
import { dposTargetPurchasedByDpo } from 'queries/graphql/dposTargetPurchasedByDpo'
import { DposTargetPurchasedByDpo } from 'queries/graphql/types/DposTargetPurchasedByDpo'
import { CheckCircle, Shuffle, PlusCircle, ChevronRight, Crosshair } from 'react-feather'
import { useSubDpo } from 'hooks/useQueryDpos'

const Row = styled.div`
  display: grid;
  grid-template-columns: auto min(120px);
  grid-column-gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  transition: background-color 0.3s ease-in;
  &:hover {
    background: ${({ theme }) => theme.text5};
  }
  padding: 0.5rem 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-gap: 5px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: auto min(45px);
    grid-column-gap: 0px;
    padding: 0.5rem 0;
  `};
`

const Cell = styled.div`
  display: block;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
`};
`

interface Targeter {
  dpoInfo: DpoInfo
  createdIndex: number | null
  defaultTargetIndex: number | null
  purchasedIndex: number | null
}

function TargeterRow({ dpoInfo, targeter, expiry }: { dpoInfo: DpoInfo; targeter: Targeter; expiry: BN }) {
  const { expectedBlockTime } = useBlockManager()
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const purchasedDpoInfo = useSubDpo(targeter.purchasedIndex)
  const createdDpoInfo = useSubDpo(targeter.createdIndex)

  const defaultDpoName = useMemo(() => {
    if (!createdDpoInfo) return
    if (dpoInfo.index.eq(targeter.defaultTargetIndex)) {
      return t('This DPO').toUpperCase()
    } else {
      return createdDpoInfo.name.toString()
    }
  }, [createdDpoInfo, dpoInfo, targeter, t])

  const purchasedDpoName = useMemo(() => {
    if (!purchasedDpoInfo) return
    if (dpoInfo.index.eq(purchasedDpoInfo.index)) {
      return t('This DPO').toUpperCase()
    } else {
      return purchasedDpoInfo.name.toString()
    }
  }, [dpoInfo, purchasedDpoInfo, t])

  return (
    <Link to={`/item/dpo/${targeter.dpoInfo.index.toString()}`} style={{ textDecoration: 'none' }}>
      <Row>
        <Cell>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'block' }}>
              <div style={{ display: 'flex' }}>
                <HeavyText mobileFontSize="14px" style={{ paddingRight: '0.5rem' }}>
                  {targeter.dpoInfo.name.toString()}
                </HeavyText>
              </div>
              {expectedBlockTime && !targeter.purchasedIndex && !targeter.createdIndex && (
                <StandardText>{blocksToCountDown(expiry, expectedBlockTime, t(`Expired`))}</StandardText>
              )}
              {expectedBlockTime && targeter.createdIndex && defaultDpoName && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                  <PlusCircle size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                  <StandardText>{`${t(`Created`).toUpperCase()}`}</StandardText>
                  <ChevronRight size={16} strokeWidth={3} color={theme.text4} />
                  <Crosshair size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                  <StandardText>{`${defaultDpoName}`}</StandardText>
                </div>
              )}

              <>
                {dpoInfo.index.eq(targeter.purchasedIndex) && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                    <CheckCircle size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                    <StandardText>{t(`Purchased`).toUpperCase()}</StandardText>
                    <ChevronRight size={16} strokeWidth={3} color={theme.text4} />
                    <Crosshair size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                    <StandardText>{`${purchasedDpoName}`}</StandardText>
                  </div>
                )}
                {!dpoInfo.index.eq(targeter.purchasedIndex) && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                    <Shuffle size={14} strokeWidth={3} color={theme.text3} style={{ marginRight: '0.5rem' }} />
                    <StandardText>{`${t(`Switched Targets`).toUpperCase()}`}</StandardText>
                    <ChevronRight size={16} strokeWidth={3} color={theme.text4} />
                    <Crosshair size={14} strokeWidth={3} color={theme.text3} style={{ marginRight: '0.5rem' }} />
                    <StandardText>{`${purchasedDpoName}`}</StandardText>
                  </div>
                )}
              </>
            </div>
          </div>
        </Cell>
        <Cell style={{ display: 'flex', alignItems: 'center' }}>
          <CircleProgress value={100 - targeter.dpoInfo.empty_seats.toNumber()} size={40} mobileFontSize="10px" />
        </Cell>
      </Row>
    </Link>
  )
}

export default function TargetedBy({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { api, connected } = useApi()
  const { error: createdError, data: createdData } = useQuery<CreatedDpoAllArgsOnly>(createdDpoAllArgsOnly, {
    variables: {},
    pollInterval: 3000,
  })
  const { error: purchasedError, data: purchasedData } = useQuery<DposTargetPurchasedByDpo>(dposTargetPurchasedByDpo, {
    variables: {},
    pollInterval: 3000,
  })
  const [targeters, setTargeters] = useState<Targeter[]>([])
  // this component might take awhile so use a loader
  const [loading, setLoading] = useState<boolean>(true)
  const { t } = useTranslation()
  const { lastBlock } = useBlockManager()
  const [purchased, setPurchased] = useState<number[][]>([])
  const [created, setCreated] = useState<{ targeter: number; defaultTarget: number }[]>([])

  // Filter all CreatedDpo events
  useEffect(() => {
    // check all createdDpo
    if (!createdData || !createdData.events) return
    setLoading(true)
    const createdIndexes: { targeter: number; defaultTarget: number }[] = []
    // args: [dpoName, target, managerSeats, baseSeats, directReferralRate, expiry, referrer]
    createdData.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic || !node.data) return
      // "dpoName,{\"dpo\":[31,30]},15,0,800,1840251,5HED..."
      const args = node.extrinsic.args
      if (!args.includes('dpo')) return
      const regexp = /\{(.*?)\}/
      const result = args.match(regexp)
      if (!result) return
      const targetDpoIndex: number = JSON.parse(result[0])['dpo'][0]
      // From the extrinsic args, check if the createdDpo was targeting current dpo
      if (dpoInfo.index.eq(targetDpoIndex)) {
        // data: [\"5Hpr...\",31]
        const targeter = JSON.parse(node.data)

        createdIndexes.push({ targeter: targeter[1], defaultTarget: targetDpoIndex })
      }
    })
    setCreated(createdIndexes)
  }, [createdData, dpoInfo])

  // Filter all DpoTargetPurchased events where
  useEffect(() => {
    // get a list of purchasedTargets for Dpos
    if (!purchasedData || !purchasedData.events || !created) return
    setLoading(true)
    const createdDpoIndexes = created.map((item) => item.targeter)
    const dposPurchasedTarget: number[][] = []
    purchasedData.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic || !node.data) return
      // Filter all DpoTargetPurchased events for dpo target
      if (!node.data.includes('dpo')) return
      // args: [buyer, target, seats] e.g. [32, 31, 25]
      const args: string[] = node.extrinsic.args.split(',')
      // Only take the ones where buyer or target is this dpo
      // If the current dpo index is purchased buyer or target or had createdDpo where default was this dpo's index
      if (dpoInfo.index.eq(args[0]) || dpoInfo.index.eq(args[1]) || createdDpoIndexes.includes(parseInt(args[0]))) {
        dposPurchasedTarget.push(args.map((arg) => parseInt(arg)))
      }
    })
    setPurchased(dposPurchasedTarget)
  }, [dpoInfo, purchasedData, created])

  // Getting DpoInfo for those that were created and purchased
  useEffect(() => {
    if (!connected || !created || !purchased) return
    // get set of all created and purchased dpos that are related to this dpo
    const purchasedOnly = purchased.map((arr) => arr[0])
    const createdOnly = created.map((createdObj) => createdObj.targeter)
    const createdOrPurchased = [...new Set([...createdOnly, ...purchasedOnly])]
    // get all dpo infos
    // if createdDpo in purchasedTarget then check if the purchase was this dpo.
    api.query.bulletTrain.dpos.multi(createdOrPurchased, (results: Option<DpoInfo>[]) => {
      setLoading(false)
      // Reset targeters if new query
      setTargeters([])
      results.forEach((result) => {
        if (result.isSome) {
          const targeterDpo = result.unwrapOrDefault()
          // From purchased list, check the buyer arg to see if targeterDpo
          // has made a purchase and return the extrinsic args
          const createdFound = created.find((txArgs) => targeterDpo.index.eq(txArgs.targeter))
          const purchasedFound = purchased.find((txArgs) => targeterDpo.index.eq(txArgs[0]))
          setTargeters((prev) => [
            ...prev,
            {
              dpoInfo: targeterDpo,
              createdIndex: createdFound ? createdFound.targeter : null,
              defaultTargetIndex: createdFound ? createdFound.defaultTarget : null,
              purchasedIndex: purchasedFound ? purchasedFound[1] : null,
            },
          ])
        }
      })
    })
  }, [api, connected, created, purchased])

  let expiry = new BN(0)
  if (lastBlock) {
    expiry = dpoInfo.expiry_blk.sub(lastBlock).gte(new BN(0)) ? dpoInfo.expiry_blk.sub(lastBlock) : new BN(0)
  }

  return (
    <>
      {createdError || purchasedError ? null : (
        <>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CustomLightSpinner src={Circle} alt="loader" size={'40px'} />
            </div>
          )}
          {targeters.length > 0 && (
            <ContentWrapper>
              <FlatCard>
                <SpacedSection>
                  <SectionHeading style={{ margin: '0' }}>{t(`Targeted by`)}</SectionHeading>
                </SpacedSection>
                {targeters.map((targeter, index) => (
                  <TargeterRow key={index} dpoInfo={dpoInfo} targeter={targeter} expiry={expiry} />
                ))}
              </FlatCard>
            </ContentWrapper>
          )}
        </>
      )}
    </>
  )
}
