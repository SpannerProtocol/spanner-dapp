import Card from 'components/Card'
import { Header2, SText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import React from 'react'
import { DpoInfo } from 'spanner-interfaces/types'

function Activities({ dpoInfo }: { dpoInfo: DpoInfo }) {
  return (
    <ContentWrapper>
      <Card>
        <Header2>Activity</Header2>
        <SpacedSection>
          <SText>
            This section will show all activities performed by this DPO such as purchases, reward releases etc. Coming
            soon!
          </SText>
        </SpacedSection>
      </Card>
    </ContentWrapper>
  )
}

export default function Activity({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  // const token = useMemo(
  //   () => (dpoInfo.token_id.isToken ? dpoInfo.token_id.asToken.toString() : dpoInfo.token_id.asDexShare.toString()),
  //   [dpoInfo]
  // )

  return (
    <>
      <Activities dpoInfo={dpoInfo} />
    </>
  )
}
