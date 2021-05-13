import { gql } from '@apollo/client'

const extrinsicsByAddress = gql`
  query ExtrinsicsByAddress($address: String!, $first: Int!, $offset: Int!) {
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

export const extrinsicsBySectionAndMethods = gql`
  query ExtrinsicsBySectionAndMethods($section: String!, $method: String!) {
    extrinsics(filter: { section: { equalTo: $section }, method: { equalTo: $method } }, orderBy: TIMESTAMP_DESC) {
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

export default extrinsicsByAddress
