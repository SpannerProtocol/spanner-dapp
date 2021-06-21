import { useQuery } from '@apollo/client'
import { Option } from '@polkadot/types'
import Circle from 'assets/svg/yellow-loader.svg'
import BN from 'bn.js'
import Divider from 'components/Divider'
import StandardModal from 'components/Modal/StandardModal'
import { CircleProgress } from 'components/ProgressBar'
import { Header4, HeavyText, SText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import { useApi } from 'hooks/useApi'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubDpo } from 'hooks/useQueryDpos'
import { createdDpoAllArgsOnly } from 'queries/graphql/createdDpoAllArgsOnly'
import { dposTargetPurchasedIncludes } from 'queries/graphql/dposTargetPurchasedIncludes'
import { CreatedDpoAllArgsOnly } from 'queries/graphql/types/CreatedDpoAllArgsOnly'
import {
  DposTargetPurchasedIncludes,
  DposTargetPurchasedIncludesVariables,
} from 'queries/graphql/types/DposTargetPurchasedIncludes'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { CheckCircle, ChevronRight, Crosshair, PlusCircle, Shuffle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DpoInfo } from 'spanner-interfaces'
import styled, { ThemeContext } from 'styled-components'
import { CustomLightSpinner } from 'theme/components'
import { blocksToCountDown } from 'utils/formatBlocks'
import IconFire from 'assets/images/icon-fire.png'
import { RowFixed } from 'components/Row'
import { ListItem, UnorderedList } from 'components/List'

const Row = styled.div`
  display: grid;
  grid-template-columns: auto min(120px);
  grid-column-gap: 1rem;
  // border-bottom: 1px solid ${({ theme }) => theme.text5};
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
  defaultSeats: number | null
  purchasedIndex: number | null
  purchasedSeats: number | null
}

function TargeterRow({ dpoInfo, targeter, expiry }: { dpoInfo: DpoInfo; targeter: Targeter; expiry: BN }) {
  const { expectedBlockTime } = useBlockManager()
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const purchasedDpoInfo = useSubDpo(targeter.purchasedIndex)
  const createdDpoInfo = useSubDpo(targeter.createdIndex)
  const [targetState, setTargetState] = useState<{ defaultDpoName?: string; purchasedDpoName?: string }>({})

  useEffect(() => {
    if (dpoInfo.index.eq(targeter.defaultTargetIndex)) {
      setTargetState((prev) => ({ ...prev, defaultDpoName: t('This DPO').toUpperCase() }))
    } else {
      setTargetState((prev) => ({ ...prev, defaultDpoName: createdDpoInfo && createdDpoInfo.name.toString() }))
    }
    if (purchasedDpoInfo && dpoInfo.index.eq(purchasedDpoInfo.index)) {
      setTargetState((prev) => ({ ...prev, purchasedDpoName: t('This DPO').toUpperCase() }))
    } else {
      setTargetState((prev) => ({ ...prev, purchasedDpoName: purchasedDpoInfo && purchasedDpoInfo.name.toString() }))
    }
    return () => setTargetState({})
  }, [createdDpoInfo, dpoInfo, purchasedDpoInfo, t, targeter.defaultTargetIndex, targeter.purchasedIndex])

  return (
    <Link to={`/dpos/dpo/${targeter.dpoInfo.index.toString()}/profile`} style={{ textDecoration: 'none' }}>
      <Row>
        <Cell>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeavyText mobileFontSize="14px" style={{ paddingRight: '0.5rem' }}>
                  {targeter.dpoInfo.name.toString()}
                </HeavyText>
                {expectedBlockTime && createdDpoInfo && !targeter.purchasedIndex && targeter.createdIndex && (
                  <SText>{blocksToCountDown(expiry, expectedBlockTime, t(`Expired`), ['m', 's'])}</SText>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.4rem 0', flexWrap: 'wrap' }}>
                {expectedBlockTime && targeter.createdIndex && (
                  <>
                    <PlusCircle size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                    <SText padding="0 0.2rem 0 0">{`${t(`Targeting`).toUpperCase()} `}</SText>
                    <SText>{` (${targeter.defaultSeats})`}</SText>
                    {targeter.purchasedIndex && <ChevronRight size={16} strokeWidth={3} color={theme.text4} />}
                  </>
                )}
                {targeter.purchasedIndex && dpoInfo.index.eq(targeter.purchasedIndex) && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                    <CheckCircle size={14} strokeWidth={3} color={theme.green2} style={{ marginRight: '0.5rem' }} />
                    <SText padding="0 0.2rem 0 0">{t(`Purchased`).toUpperCase()}</SText>
                    <SText>{` (${targeter.purchasedSeats})`}</SText>
                  </div>
                )}
                {targeter.purchasedIndex && !dpoInfo.index.eq(targeter.purchasedIndex) && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                    <Shuffle size={14} strokeWidth={3} color={theme.text3} style={{ marginRight: '0.5rem' }} />
                    <SText>{`${t(`Switched`).toUpperCase()}`}</SText>
                    <ChevronRight size={16} strokeWidth={3} color={theme.text4} />
                  </div>
                )}
                {targeter.purchasedIndex && !dpoInfo.index.eq(targeter.purchasedIndex) && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0' }}>
                    <Crosshair size={14} strokeWidth={3} color={theme.text3} style={{ marginRight: '0.5rem' }} />
                    <SText padding="0 0.2rem 0 0">{`${targetState.purchasedDpoName}`}</SText>
                    <SText>{` (${targeter.purchasedSeats})`}</SText>
                  </div>
                )}
              </div>
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
  const { loading: createdLoading, error: createdError, data: createdData } = useQuery<CreatedDpoAllArgsOnly>(
    createdDpoAllArgsOnly,
    {
      variables: {},
    }
  )
  const { loading: purchasedLoading, error: purchasedError, data: purchasedData } = useQuery<
    DposTargetPurchasedIncludes,
    DposTargetPurchasedIncludesVariables
  >(dposTargetPurchasedIncludes, {
    variables: {
      includes: 'dpo',
    },
  })
  // this component might take awhile so use a loader
  const { t } = useTranslation()
  const { lastBlock } = useBlockManager()
  const [targeters, setTargeters] = useState<Targeter[] | undefined>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const theme = useContext(ThemeContext)

  // Getting DpoInfo for those that were created and purchased
  useEffect(() => {
    // check all createdDpo
    if (!createdData || !createdData.events) return
    if (!purchasedData || !purchasedData.events) return
    const createdIndexes: { targeter: number; defaultTarget: number; defaultSeats: number }[] = []
    // args: [dpoName, target, managerSeats, baseSeats, directReferralRate, expiry, referrer]
    createdData.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic || !node.data) return
      // "dpoName,{\"dpo\":[31,30]},15,0,800,1840251,5HED..."
      const args = node.extrinsic.args
      if (!args.includes('dpo')) return
      const regexp = /\{(.*?)\}/
      const result = args.match(regexp)
      if (!result) return
      const targetDpo: number[] = JSON.parse(result[0])['dpo']
      // From the extrinsic args, check if the createdDpo was targeting current dpo
      if (dpoInfo.index.eq(targetDpo[0])) {
        // data: [\"5Hpr...\",31]
        const targeter = JSON.parse(node.data)
        createdIndexes.push({ targeter: targeter[1], defaultTarget: targetDpo[0], defaultSeats: targetDpo[1] })
      }
    })
    const createdDpoIndexes = createdIndexes.map((item) => item.targeter)
    const dposPurchasedTarget: number[][] = []
    purchasedData.events.nodes.forEach((node) => {
      if (!node || !node.extrinsic || !node.data) return
      // Filter all DpoTargetPurchased events for dpo target
      if (!node.data.includes('dpo')) return
      // args: [buyer, target, seats] e.g. [32, 31, 25]
      const args: string[] = node.extrinsic.args.split(',')
      // Only take the ones where buyer or target is this dpo
      // If the current dpo index is purchased buyer or target or had createdDpo where default was this dpo's index
      if (dpoInfo.index.eq(args[1]) || createdDpoIndexes.includes(parseInt(args[0]))) {
        dposPurchasedTarget.push(args.map((arg) => parseInt(arg)))
      }
    })
    const created = createdIndexes
    const purchased = dposPurchasedTarget
    if (!connected || created.length === 0 || purchased.length === 0) return
    // get set of all created and purchased dpos that are related to this dpo
    const purchasedOnly = purchased.map((arr) => arr[0])
    const createdOnly = created.map((createdObj) => createdObj.targeter)
    const createdOrPurchased = [...new Set([...createdOnly, ...purchasedOnly])]
    // if createdDpo in purchasedTarget then check if the purchase was this dpo.
    let unsubscribe: () => void
    if (createdOrPurchased.length === 0) {
      setTargeters(undefined)
      return
    }
    api.query.bulletTrain.dpos
      .multi(createdOrPurchased, (results: Option<DpoInfo>[]) => {
        // Reset targeters if new query
        const allTargets: Targeter[] = []
        results.forEach((result) => {
          if (result.isSome) {
            const targeterDpo = result.unwrapOrDefault()
            // From purchased list, check the buyer arg to see if targeterDpo
            // has made a purchase and return the extrinsic args
            const createdFound = created.find((txArgs) => targeterDpo.index.eq(txArgs.targeter))
            const purchasedFound = purchased.find((txArgs) => targeterDpo.index.eq(txArgs[0]))
            allTargets.push({
              dpoInfo: targeterDpo,
              createdIndex: createdFound ? createdFound.targeter : null,
              defaultTargetIndex: createdFound ? createdFound.defaultTarget : null,
              defaultSeats: createdFound ? createdFound.defaultSeats : null,
              purchasedIndex: purchasedFound ? purchasedFound[1] : null,
              purchasedSeats: purchasedFound ? purchasedFound[2] : null,
            })
          }
        })
        setTargeters([...allTargets])
      })
      .then((unsub) => {
        unsubscribe = unsub
      })
    return () => {
      unsubscribe && unsubscribe()
    }
  }, [api, connected, dpoInfo, createdData, purchasedData])

  const targeterRows = useMemo(() => {
    if (!targeters) return null
    if (targeters.length === 0) return null
    let expiry = new BN(0)
    if (lastBlock) {
      expiry = dpoInfo.expiry_blk.sub(lastBlock).gte(new BN(0)) ? dpoInfo.expiry_blk.sub(lastBlock) : new BN(0)
    }
    return (
      <>
        {targeters.map((targeter, index) => {
          return (
            <>
              <TargeterRow key={index} dpoInfo={dpoInfo} targeter={targeter} expiry={expiry} />
              {index !== targeters.length - 1 && <Divider />}
            </>
          )
        })}
      </>
    )
  }, [dpoInfo, lastBlock, targeters])

  const summaryData = useMemo(() => {
    if (!targeters) return null
    let committedDpos = 0
    let committedSeats = 0
    let remainingDpos = 0
    let remainingSeats = 0
    targeters.forEach((t) => {
      // All DPO commitments
      if (t.defaultSeats) {
        committedDpos = committedDpos + 1
        committedSeats = committedSeats + t.defaultSeats
      }
      // Remaining DPOs
      if (!t.purchasedIndex && t.defaultSeats) {
        remainingDpos = remainingDpos + 1
        remainingSeats = remainingSeats + t.defaultSeats
      }
    })
    return (
      <SpacedSection>
        <Header4 style={{ margin: '0' }}>
          {t(`DPOs assisting`)} {dpoInfo.name.toString()}
        </Header4>
        <UnorderedList>
          <ListItem>
            <SText>{`${t(`Total of`)} ${committedDpos} ${t(`DPOs`)} 
            ${t(`committed to crowdfund`)} ${committedSeats} ${t(`Seats`)}`}</SText>
          </ListItem>
          {committedSeats > 100 && (
            <ListItem>
              <RowFixed>
                <SText width="fit-content" padding="0 0.25rem 0 0">{`${t(`Excess commitment of`)} ${
                  committedSeats - 100
                } Seats`}</SText>
                <img src={IconFire} width="16px" alt="fire hot icon" />
              </RowFixed>
            </ListItem>
          )}
          {committedDpos !== remainingDpos && remainingDpos !== 0 && (
            <ListItem>
              <SText width="fit-content" padding="0 0.25rem 0 0">{`${remainingDpos} ${t(`DPOs`)} 
              ${t(`are still crowdfunding`)} ${remainingSeats} ${t(`Seats`)}`}</SText>
            </ListItem>
          )}
        </UnorderedList>
      </SpacedSection>
    )
  }, [targeters, t, dpoInfo])

  // Sections for SectionNoCard
  const targetSections = useMemo(() => {
    const result: JSX.Element[] = []
    if (summaryData) result.push(summaryData)
    if (targeterRows) result.push(targeterRows)
    return result
  }, [summaryData, targeterRows])

  return (
    <>
      <StandardModal
        title={t(`Targeting DPO Progress`)}
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
        desktopScroll={true}
      >
        {targetSections}
      </StandardModal>
      {createdError || purchasedError ? null : (
        <>
          {createdLoading || purchasedLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CustomLightSpinner src={Circle} alt="loader" size={'40px'} />
            </div>
          ) : (
            <>
              {targeterRows && targetSections ? (
                <>
                  {summaryData}
                  <SpacedSection>
                    <SText textAlign="center" width="100%" color={theme.primary1} onClick={() => setModalOpen(true)}>
                      {t(`See all DPOs`)}
                    </SText>
                  </SpacedSection>
                </>
              ) : (
                <>
                  <Header4 style={{ margin: '0' }}>
                    {t(`DPOs assisting`)} {dpoInfo.name.toString()}
                  </Header4>
                  <SpacedSection>
                    <SText>{`${t(`No DPOs are targeting`)} ${dpoInfo.name.toString()}`}</SText>
                  </SpacedSection>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
