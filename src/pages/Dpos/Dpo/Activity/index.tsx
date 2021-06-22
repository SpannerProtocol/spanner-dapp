import Card from 'components/Card'
import { Header2, SText } from 'components/Text'
import { ContentWrapper, SpacedSection } from 'components/Wrapper'
import React from 'react'
import { DpoInfo } from 'spanner-interfaces/types'
import { useTranslation } from 'react-i18next'

function Activities({ dpoInfo }: { dpoInfo: DpoInfo }) {
  const { t } = useTranslation()
  return (
    <ContentWrapper>
      <Card margin="0 0 1rem 0">
        <Header2>{t('Activity')}</Header2>
        <SpacedSection>
          <SText>
            {t(
              'This section will show all activities performed by this DPO such as purchases, reward releases etc. Coming soon!'
            )}
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
