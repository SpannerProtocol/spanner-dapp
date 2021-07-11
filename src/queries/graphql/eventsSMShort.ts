import { gql } from '@apollo/client'

// Query events by Section and Method, response is shortened to only necessary info
// to avoid large response
const eventsSMShort = gql`
  query EventsSMShort($section: String!, $method: String!) {
    events(filter: { section: { equalTo: $section }, method: { equalTo: $method } }) {
      totalCount
      nodes {
        data
        extrinsic {
          args
        }
      }
    }
  }
`

export default eventsSMShort
