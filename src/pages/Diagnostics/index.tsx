import Card from 'components/Card'
import { PageWrapper, SpacedSection, Wrapper } from 'components/Wrapper'
import { useReferrer } from 'hooks/useReferrer'
import useWallet from 'hooks/useWallet'
import { useProjectState } from 'state/project/hooks'
import { useReferrerManager } from 'state/referrer/hooks'
import { SText, Heading, Header3 } from '../../components/Text'

export default function Diagnostics() {
  const referrer = useReferrer()
  const referrerState = useReferrerManager()
  const projectState = useProjectState()
  const wallet = useWallet()

  const referrerLocal = window.localStorage.getItem('redux_localstorage_simple_referrer')

  return (
    <PageWrapper style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
      <Wrapper
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card style={{ textAlign: 'left' }}>
          <Heading>{`Diagnostics`}</Heading>
          <SpacedSection>
            <Header3>{`Referral (DynamoDB)`}</Header3>
            <SText>{referrer}</SText>
          </SpacedSection>
          {referrerState.referrerState && projectState.selectedProject && referrerState.referrerState.referrer && (
            <SpacedSection>
              <Header3>{`Referrer State (from REDUX)`}</Header3>
              <SText>{referrerState.referrerState.referrer[projectState.selectedProject.token]?.referrer}</SText>
              <SText>{referrerState.referrerState.referrer[projectState.selectedProject.token]?.storedRemotely}</SText>
            </SpacedSection>
          )}
          {referrerLocal && (
            <SpacedSection>
              <Header3>{`Local Storage`}</Header3>
              <SText>{referrerLocal.toString()}</SText>
            </SpacedSection>
          )}
          <SpacedSection>
            <Header3>{`Address`}</Header3>
            <SText>{wallet?.address}</SText>
          </SpacedSection>
        </Card>
      </Wrapper>
    </PageWrapper>
  )
}
