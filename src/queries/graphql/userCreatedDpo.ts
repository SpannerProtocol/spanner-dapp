import { gql } from '@apollo/client'

const userCreatedDpo = gql`
  query UserCreatedDpo($address: String!) {
    events(filter: { method: { includes: "CreatedDpo" }, data: { includes: $address } }) {
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

export default userCreatedDpo
