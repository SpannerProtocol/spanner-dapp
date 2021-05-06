import { gql } from '@apollo/client'

const transferIn = gql`
  query TransferIn($address: String!, $first: Int!, $offset: Int!) {
    account(id: $address) {
      transferIn(orderBy: TIMESTAMP_DESC, first: $first, offset: $offset) {
        totalCount
        nodes {
          id
          amount
          token
          fromId
          toId
          timestamp
        }
      }
    }
  }
`

export default transferIn
