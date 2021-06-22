import { BannerCard } from 'components/Card'
import { Header2, Header4 } from 'components/Text'
import { ContentWrapper } from 'components/Wrapper'
import { ProjectInfo } from 'hooks/useProjectInfo'
import React from 'react'
import { useTranslation } from 'translate'

export default function AssetNFT({ projectInfo }: { projectInfo: ProjectInfo }) {
  const { t } = useTranslation()

  return (
    <ContentWrapper>
      <BannerCard padding="3rem 1rem">
        <Header2 colorIsPrimary>{t(`NFTs`)}</Header2>
        <Header4>{`${t(`Crowdfund for NFTs`)}. ${t(`Coming soon`)}.`}</Header4>
      </BannerCard>
    </ContentWrapper>
  )
}
