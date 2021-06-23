import { gql } from '@apollo/client'

const blockTimestamp = gql`
  query BlockTimestamp($hash: String!) {
    block(id: $hash) {
      id
      number
      timestamp
    }
  }
`

export default blockTimestamp
