import { gql } from '@apollo/client'

// This query only works with CreatedDpo.
export const dposTargetPurchasedByDpo = gql`
  query DposTargetPurchasedByDpo {
    events(filter: { method: { includes: "DpoTargetPurchased" }, data: { includes: "dpo" } }) {
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
