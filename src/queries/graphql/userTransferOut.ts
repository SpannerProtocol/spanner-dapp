import { gql } from '@apollo/client'

const userTransferOut = gql`
  query UserTransferOut($address: String!) {
    account(id: $address) {
      transferOut(orderBy: TIMESTAMP_DESC) {
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

export default userTransferOut
