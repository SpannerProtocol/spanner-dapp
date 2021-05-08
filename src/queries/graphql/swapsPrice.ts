import { gql } from '@apollo/client'

const swapsPrice = gql`
  query SwapsPrice($first: Int!, $offset: Int!, $token1: String!, $token2: String!) {
    swaps(
      orderBy: TIMESTAMP_DESC
      first: $first
      offset: $offset
      filter: { token1: { equalTo: $token1 }, token2: { equalTo: $token2 } }
    ) {
      totalCount
      nodes {
        id
        timestamp
        token1
        token2
        tokenAmount1
        tokenAmount2
        price
      }
    }
  }
`

export default swapsPrice
