import Card from 'components/Card'
import CopyHelper from 'components/Copy/Copy'
import { Icon } from 'components/Image'
import { RowBetween, RowFixed } from 'components/Row'
import { Header2, Header4, SText } from 'components/Text'
import { ContentWrapper, Section, SpacedSection } from 'components/Wrapper'
import { useDpoManager, useQueryDpoMembers } from 'hooks/useQueryDpoMembers'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DpoInfo } from 'spanner-interfaces/types'
import { shortenAddr } from 'utils/truncateString'
import DpoIcon from '../../../../assets/svg/icon-dpo.svg'
import UserIcon from '../../../../assets/svg/icon-user.svg'

export function Members({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  const dpoMembers = useQueryDpoMembers(dpoInfo.index.toString())
  const manager = useDpoManager(dpoInfo.index.toString(), dpoInfo)
  const { t } = useTranslation()

  // const token = useMemo(
  //   () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
  //   [dpoInfo]
  // )

  return (
    <>
      <ContentWrapper>
        <Card margin="0 0 1rem 0">
          <Header2>{t(`Members`)}</Header2>
          {manager && (
            <Section>
              <Header4>{t(`Manager`)}</Header4>
              <RowBetween>
                <RowFixed width="fit-content">
                  <Icon src={UserIcon} width="12px" alt="user icon" withBackground style={{ marginRight: '0.5rem' }} />
                  <CopyHelper toCopy={`${manager.buyer.asPassenger.toString()}`} childrenIsIcon={true}>
                    <SText>{`${shortenAddr(manager.buyer.asPassenger.toString(), 8)}`}</SText>
                  </CopyHelper>
                </RowFixed>
                <SText>{`${manager.number_of_seats.toString()} ${t(`Seats`)}`}</SText>
              </RowBetween>
            </Section>
          )}
          <Section>
            <Header4>{t(`Members`)}</Header4>
            {dpoMembers.map((entry, index) => (
              <div key={index}>
                {entry[1].buyer.isPassenger && (
                  <>
                    {!entry[1].buyer.asPassenger.eq(dpoInfo.manager.toString()) && (
                      <RowBetween key={index}>
                        <RowFixed width="fit-content">
                          <Icon
                            src={UserIcon}
                            width="12px"
                            alt="dpo icon"
                            withBackground
                            style={{ marginRight: '0.5rem' }}
                          />
                          <CopyHelper toCopy={`${entry[1].buyer.asPassenger.toString()}`} childrenIsIcon={true}>
                            <SText>{`${shortenAddr(entry[1].buyer.asPassenger.toString(), 8)}`}</SText>
                          </CopyHelper>
                        </RowFixed>
                        <SText>{`${entry[1].number_of_seats.toString()} ${t(`Seats`)}`}</SText>
                      </RowBetween>
                    )}
                  </>
                )}
                {entry[1].buyer.isDpo && (
                  <RowBetween key={index}>
                    <RowFixed width="fit-content">
                      <Icon
                        src={DpoIcon}
                        width="12px"
                        alt="dpo icon"
                        withBackground
                        padding="0.2rem"
                        style={{ marginRight: '0.5rem' }}
                      />
                      <CopyHelper toCopy={`${entry[1].buyer.asDpo.toString()}`} childrenIsIcon={true}>
                        <SText>{`DPO #${entry[1].buyer.asDpo.toString()}`}</SText>
                      </CopyHelper>
                    </RowFixed>
                    <SText>{`${entry[1].number_of_seats.toString()} ${t(`Seats`)}`}</SText>
                  </RowBetween>
                )}
              </div>
            ))}
          </Section>
        </Card>
      </ContentWrapper>
    </>
  )
}

function CollaborationStructure({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return (
    <ContentWrapper>
      <Card margin="0 0 1rem 0">
        <Header2>Collaboration Structure</Header2>
        <SpacedSection>
          <SText>
            Collaboration Structure will show all DPOs collaborating with this DPO towards a common goal. Coming soon!
          </SText>
        </SpacedSection>
      </Card>
    </ContentWrapper>
  )
}

export default function Organization({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  // const token = useMemo(
  //   () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
  //   [dpoInfo]
  // )

  return (
    <>
      <Members dpoInfo={dpoInfo} />
      <CollaborationStructure dpoInfo={dpoInfo} />
    </>
  )
}
