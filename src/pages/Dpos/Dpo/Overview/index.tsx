import Card from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { AnyQuestionHelper } from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { Header2, Header4, SText } from 'components/Text'
import { ContentWrapper, IconWrapper, Section, StateWrapper } from 'components/Wrapper'
import { useBlockManager } from 'hooks/useBlocks'
import { useUserInDpo } from 'hooks/useUser'
import useWallet, { useIsConnected } from 'hooks/useWallet'
import React, { useContext } from 'react'
import { Share } from 'react-feather'
import { DpoInfo } from 'spanner-interfaces'
import { useProjectManager } from 'state/project/hooks'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'translate'
import { DAPP_HOST, DPO_STATE_COLORS, DPO_STATE_TOOLTIPS } from '../../../../constants'

// const statsBg = 'linear-gradient(90deg, #FFBE2E -11.67%, #FF9E04 100%)'

export default function Overview({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const wallet = useWallet()
  // const { chainDecimals } = useSubstrate()
  const userInDpo = useUserInDpo(dpoInfo.index.toString(), wallet?.address)
  const isConnected = useIsConnected()
  const { lastBlock } = useBlockManager()
  const { projectState } = useProjectManager()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  // const token = useMemo(() => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : ''), [dpoInfo])
  return (
    <ContentWrapper>
      <Card style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Section>
          <RowBetween>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Header2 color={theme.primary1}>{dpoInfo.name.toString()}</Header2>
            </div>
            <AnyQuestionHelper text={DPO_STATE_TOOLTIPS[dpoInfo.state.toString()]}>
              {lastBlock && dpoInfo.state.isCreated && dpoInfo.expiry_blk.lt(lastBlock) ? (
                <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                  {t(`EXPIRED`)}
                </StateWrapper>
              ) : (
                <StateWrapper color={'#fff'} background={DPO_STATE_COLORS[dpoInfo.state.toString()]}>
                  {t(dpoInfo.state.toString())}
                </StateWrapper>
              )}
            </AnyQuestionHelper>
          </RowBetween>
          <Header4>{`DPO #${dpoInfo.index.toString()}`}</Header4>
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
            {projectState.selectedProject && wallet && wallet.address && (
              <CopyHelper
                toCopy={`${DAPP_HOST}/#/item/dpo/${dpoInfo.index.toString()}?ref=${wallet.address}&project=${
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
        {/* {!dpoInfo.state.isCreated && (
          <Section>
            <HeavyText color={theme.primary1}>{t(`Total Rewards Received`)}</HeavyText>
            <StatDisplayContainer>
              <StatDisplayGrid>
                <StatContainer maxWidth="none" background={statsBg}>
                  <StatValue small={true}>
                    {formatToUnit(dpoInfo.total_yield_received.toString(), chainDecimals, 2)}{' '}
                    <TokenText color="#fff" mobileFontSize="8px">
                      {token}
                    </TokenText>
                  </StatValue>
                  <StatText>{t(`Yield`)}</StatText>
                </StatContainer>
                <StatContainer maxWidth="none" background={statsBg}>
                  <StatValue small={true}>
                    {formatToUnit(dpoInfo.total_bonus_received.toString(), chainDecimals)}{' '}
                    <TokenText color="#fff" mobileFontSize="8px">
                      {token}
                    </TokenText>
                  </StatValue>
                  <StatText>{t(`Bonus`)}</StatText>
                </StatContainer>
                {dpoInfo.target.isTravelCabin && (
                  <StatContainer maxWidth="none" background={statsBg}>
                    <StatValue small={true}>
                      {formatToUnit(dpoInfo.total_milestone_received.toString(), chainDecimals, 2)}{' '}
                      <TokenText color="#fff" mobileFontSize="8px">
                        {token}
                      </TokenText>
                    </StatValue>
                    <StatText>{t(`Milestone`)}</StatText>
                  </StatContainer>
                )}
              </StatDisplayGrid>
            </StatDisplayContainer>
          </Section>
        )} */}
      </Card>
    </ContentWrapper>
  )
}
