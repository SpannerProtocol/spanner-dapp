import Card from 'components/Card'
import Divider from 'components/Divider'
import { ContentWrapper, ClickableSection, CenterWrapper } from 'components/Wrapper'
import { useState, useContext } from 'react'
import { ChevronDown } from 'react-feather'
import { ThemeContext } from 'styled-components'

interface SectionCardProps {
  sections: JSX.Element[]
}

function AddMore({ onClick }: { onClick: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <>
      <Divider margin="0.5rem 0" />
      <ClickableSection onClick={onClick}>
        <CenterWrapper>
          <ChevronDown color={theme.gray1} size={24} strokeWidth={'2px'} />
        </CenterWrapper>
      </ClickableSection>
    </>
  )
}

export default function SectionCard({ sections }: SectionCardProps) {
  const [visible, setVisible] = useState<number>(0)

  const add = () => setVisible((prev) => prev + 1)

  return (
    <>
      {sections.length === 0 ? null : (
        <ContentWrapper>
          <Card>
            {sections.slice(0, visible + 1).map((section, index) => (
              <>
                {index !== 0 && <Divider margin="0.5rem 0" />}
                {section}
              </>
            ))}
            {visible < sections.length - 1 && <AddMore onClick={add} />}
          </Card>
        </ContentWrapper>
      )}
    </>
  )
}

export function SectionNoCard({ sections }: SectionCardProps) {
  const [visible, setVisible] = useState<number>(0)

  const add = () => setVisible((prev) => prev + 1)

  return (
    <>
      {sections.length === 0 ? null : (
        <>
          {sections.slice(0, visible + 1).map((section, index) => (
            <>
              {index !== 0 && <Divider margin="0.5rem 0" />}
              {section}
            </>
          ))}
          {visible < sections.length - 1 && <AddMore onClick={add} />}
        </>
      )}
    </>
  )
}
