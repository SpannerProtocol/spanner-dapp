import { gql } from '@apollo/client'

const extrinsics = gql`
  query Extrinsics($address: String!, $first: Int!, $offset: Int!) {
    extrinsics(filter: { signerId: { equalTo: $address } }, orderBy: TIMESTAMP_DESC, first: $first, offset: $offset) {
      totalCount
      nodes {
        id
        section
        method
        args
        signerId
        timestamp
        block {
          id
          number
        }
        isSuccess
      }
    }
  }
`

export default extrinsics
