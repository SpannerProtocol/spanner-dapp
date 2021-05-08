import { gql } from '@apollo/client'

const transferOut = gql`
  query TransferOut($address: String!, $first: Int!, $offset: Int!) {
    account(id: $address) {
      transferOut(orderBy: TIMESTAMP_DESC, first: $first, offset: $offset) {
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

export const transferOutTokenFilter = gql`
  query TransferOutTokenFilter($address: String!, $first: Int!, $offset: Int!, $token: String!) {
    account(id: $address) {
      transferOut(orderBy: TIMESTAMP_DESC, first: $first, offset: $offset, filter: { token: { equalTo: $token } }) {
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

export default transferOut
