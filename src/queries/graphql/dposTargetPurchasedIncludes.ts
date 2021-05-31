import { gql } from '@apollo/client'

// This query only works with CreatedDpo.
export const dposTargetPurchasedIncludes = gql`
  query DposTargetPurchasedIncludes($includes: String!) {
    events(filter: { method: { includes: "DpoTargetPurchased" }, data: { includes: $includes } }) {
      totalCount
      nodes {
        section
        method
        data
        extrinsic {
          args
        }
      }
    }
  }
`
