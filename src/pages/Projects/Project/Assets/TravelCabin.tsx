import BulletTrainBanner from 'assets/images/banner-bullettrain.jpg'
import { BannerCard } from 'components/Card'
import Divider from 'components/Divider'
import { Header2, Header4 } from 'components/Text'
import { ContentWrapper, Section } from 'components/Wrapper'
import { ProjectInfo } from 'hooks/useProjectInfo'
import BulletTrainStats from 'pages/Assets/TravelCabin/Components/Stats'
import { CabinsSection } from 'pages/Assets/TravelCabin/Components/Cabins'
import { GlobalMilestoneReward } from 'pages/Assets/TravelCabin/Components/Milestone'
import { useTranslation } from 'translate'

export default function AssetTravelCabin({ projectInfo }: { projectInfo: ProjectInfo }) {
  const { t } = useTranslation()

  return (
    <ContentWrapper>
      <BannerCard url={BulletTrainBanner} padding="3rem 1rem" margin="0 0 1rem 0" darkenBackground>
        <Header2 colorIsPrimary>{t(`BulletTrain TravelCabins`)}</Header2>
        <Header4 color="#fff">{`${t(`Earn by depositing your tokens and referring your friends`)}!`}</Header4>
        <Divider margin="0.5rem 0" />
        <Section style={{ width: '100%' }}>{projectInfo && <BulletTrainStats token={projectInfo.token} />}</Section>
      </BannerCard>
      <GlobalMilestoneReward />
      <CabinsSection />
    </ContentWrapper>
  )
}
