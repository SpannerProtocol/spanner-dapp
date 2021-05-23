import { gql } from '@apollo/client'

// This query only works with CreatedDpo.
export const createdDpoAllArgsOnly = gql`
  query CreatedDpoAllArgsOnly {
    events(filter: { method: { includes: "CreatedDpo" } }) {
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
