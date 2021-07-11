import Card from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { SLink, SHashLink } from 'components/Link'
import { AnyQuestionHelper } from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { Header1, Header4, SText } from 'components/Text'
import { ContentWrapper, IconWrapper, Section, StateWrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useSubDpo } from 'hooks/useQueryDpos'
import { useDpoTravelCabinInventoryIndex, useSubTravelCabin } from 'hooks/useQueryTravelCabins'
import { useUserInDpo } from 'hooks/useUser'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useContext } from 'react'
import { Share } from 'react-feather'
import { DpoInfo } from 'spanner-interfaces'
import { useProjectManager } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'translate'
import { DAPP_HOST, DPO_STATE_COLORS, DPO_STATE_TOOLTIPS } from '../../../../constants'

function TargetDpo({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubDpo(dpoInfo.target.asDpo[0].toString())
  if (!target) return null
  return (
    <>
      <RowFixed>
        <SText width="fit-content">{`${t(`Crowdfunding`)} ${t(`for`)}`}</SText>
        <SLink to={`/dpos/dpo/${dpoInfo.target.asDpo[0].toString()}/activity`} padding="0 0 0 0.25rem" colorIsBlue>
          {t(`DPO`)}: {target.name.toString()}
        </SLink>
      </RowFixed>
    </>
  )
}

function TargetCabin({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  const target = useSubTravelCabin(dpoInfo.target.asTravelCabin.toString())
  const buyerInventoryIndex = useDpoTravelCabinInventoryIndex(
    dpoInfo.index.toString(),
    dpoInfo.target.asTravelCabin.toString()
  )

  if (!target) return null
  const hasPurchased = buyerInventoryIndex ? true : false
  const token = dpoInfo.token_id.asToken.toString().toLowerCase()
  return (
    <>
      {hasPurchased ? (
        <RowFixed>
          <SText width="fit-content">{`${t(`Crowdfunded`)} ${t(`for`)}`}</SText>
          <SLink
            to={`/assets/travelcabin/${dpoInfo.target.asTravelCabin.toString()}/inventory/${buyerInventoryIndex}`}
            padding="0 0 0 0.25rem"
            colorIsBlue
          >
            {t(`TravelCabin`)}: {target.name.toString()}
          </SLink>
        </RowFixed>
      ) : (
        <RowFixed>
          <SText width="fit-content">{`${t(`Crowdfunding`)} ${t(`for`)}`}</SText>
          <SHashLink
            to={`/projects/${token}?asset=TravelCabin#${target.name.toString()}`}
            padding="0 0 0 0.25rem"
            colorIsBlue
          >
            {t(`TravelCabin`)}: {target.name.toString()}
          </SHashLink>
        </RowFixed>
      )}
    </>
  )
}

export default function Overview({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const wallet = useWallet()
  // const { chainDecimals } = useSubstrate()
  const userInDpo = useUserInDpo(dpoInfo.index.toString(), wallet?.address)
  const isConnected = useIsConnected()
  const { projectState } = useProjectManager()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const { lastBlock } = useBlockManager()

  // const token = useMemo(() => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : ''), [dpoInfo])
  return (
    <ContentWrapper>
      <Card margin="1rem 0">
        <Section>
          <RowBetween>
            <Header1 colorIsPrimary width="fit-content">
              {dpoInfo.name.toString()}
            </Header1>
            <AnyQuestionHelper text={DPO_STATE_TOOLTIPS[dpoInfo.state.toString()]}>
              {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) ? (
                <StateWrapper color={'#fff'} background={DPO_STATE_COLORS['EXPIRED']}>
                  {t(`EXPIRED`)}
                </StateWrapper>
              ) : (
                <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                  {t(dpoInfo.state.toString())}
                </StateWrapper>
              )}
            </AnyQuestionHelper>
          </RowBetween>
          <Header4 color={theme.text3}>{`DPO #${dpoInfo.index.toString()}`}</Header4>
          <RowBetween>
            {dpoInfo.target.isDpo && <TargetDpo dpoInfo={dpoInfo} />}
            {dpoInfo.target.isTravelCabin && <TargetCabin dpoInfo={dpoInfo} />}
            {projectState.selectedProject && wallet && wallet.address && (
              <CopyHelper
                toCopy={`${DAPP_HOST}/#/dpos/dpo/${dpoInfo.index.toString()}/activity?ref=${wallet.address}&project=${
                  projectState.selectedProject.token
                }`}
                childrenIsIcon={true}
              >
                <IconWrapper>
                  <Share size={20} />
                </IconWrapper>
              </CopyHelper>
            )}
          </RowBetween>
        </Section>
        <Section>
          <RowBetween>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isConnected && userInDpo.inDpo && (
                <SText color={theme.secondary1} style={{ textAlign: 'center' }}>
                  {t(`You are this DPO's`)} {userInDpo.role}
                </SText>
              )}
            </div>
          </RowBetween>
        </Section>
      </Card>
    </ContentWrapper>
  )
}
