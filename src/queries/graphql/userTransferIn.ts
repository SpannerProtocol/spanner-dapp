import { gql } from '@apollo/client'

const userTransferIn = gql`
  query UserTransferIn($address: String!) {
    account(id: $address) {
      transferIn(orderBy: TIMESTAMP_DESC) {
        totalCount
        nodes {
          amount
          token
          timestamp
          event {
            extrinsic {
              section
              method
              args
            }
          }
        }
      }
    }
  }
`

export default userTransferIn
