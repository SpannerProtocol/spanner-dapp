import styled from 'styled-components'

export const StateOverlay = styled.div<{ isOn?: boolean }>`
  filter: ${({ isOn }) => (isOn ? 'grayscale(0.5) opacity(0.8) saturate(.8)' : 'none')};
`
