import { gql } from '@apollo/client'

// This query only works with CreatedDpo.
// Has a specific endsWith query to query the last arg in the stringified array which is the DpoIndex created
export const createdDpoByData = gql`
  query EventCreatedDpoByData($first: Int!, $offset: Int!, $endsWith: String!) {
    events(
      filter: { method: { includes: "CreatedDpo" }, data: { endsWith: $endsWith } }
      first: $first
      offset: $offset
    ) {
      totalCount
      nodes {
        id
        section
        method
        data
        extrinsic {
          method
          section
          args
        }
      }
    }
  }
`
