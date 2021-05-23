import { gql } from '@apollo/client'

// This query only works with CreatedDpo.
// Has a specific endsWith query to query the last arg in the stringified array which is the DpoIndex created
export const createdDpoByData = gql`
  query CreatedDpoByData($first: Int!, $offset: Int!, $includes: String!) {
    events(
      filter: { method: { includes: "CreatedDpo" }, data: { includes: $includes } }
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
