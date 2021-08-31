import { useState } from 'react'
import styled from 'styled-components'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RowBetween } from 'components/Row'
import { HeavyText } from 'components/Text'
import { Section } from 'components/Wrapper'

interface ExpandCardProps {
  defaultExpanded: boolean
  icon?: JSX.Element
  title?: string
  borderColor?: string
  children: React.ReactNode
}

const ExpandCardWrapper = styled.div<{ borderColor?: string }>`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  width: 100%;
  border: 1.5px solid ${({ theme, borderColor }) => (borderColor ? borderColor : theme.text3)};
  border-radius: 8px;
  padding: 0.5rem;
`

const ExpandCardTop = styled.div`
  border-radius: 8px 8px 0 0;
  border: 1px transparent;
`

const ExpandCardBottom = styled.div`
  border-radius: 0 0 8px 8px;
`

const ExpandIcon = styled.div`
  position: relative;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export default function ExpandCard(props: ExpandCardProps) {
  const { defaultExpanded, title, borderColor, children } = props
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <>
      <ExpandCardWrapper borderColor={borderColor}>
        <ExpandCardTop>
          <Section style={{ margin: '0px' }}>
            <RowBetween>
              <HeavyText>{title}</HeavyText>
              <ExpandIcon onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <FontAwesomeIcon icon={faCaretUp} size={'1x'} style={{ color: '#000', margin: '0.25rem' }} />
                ) : (
                  <FontAwesomeIcon icon={faCaretDown} size={'1x'} style={{ color: '#000', margin: '0.25rem' }} />
                )}
              </ExpandIcon>
            </RowBetween>
          </Section>
        </ExpandCardTop>
        <ExpandCardBottom>{expanded ? children : <></>}</ExpandCardBottom>
      </ExpandCardWrapper>
    </>
  )
}
