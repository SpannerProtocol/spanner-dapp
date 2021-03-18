import styled from 'styled-components'

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 2fr));
  grid-auto-rows: auto;
  grid-gap: 1rem;
`

export const CardHeader = styled.header`
  padding: 15px 15px 7.5px 15px;
`

export const CardBody = styled.div`
  padding: 7.5px 15px 15px 15px;
`

export const CardHeading = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  text-align: left;
`

export const CardFlexWrapper = styled.div`
  display: inline-flex;
  width: 100%;
`

export const CardText = styled.div`
  text-align: left;
`

export const CardTextLeft = styled.div`
  width: 50%;
  text-align: left;
  color: #fff
`

export const CardTextRight = styled.div`
  width: 50%;
  text-align: right;
  color: #fff
`

