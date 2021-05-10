import { gql } from '@apollo/client'

const userPortfolio = gql`
  query UserPortfolio($address: String!) {
    account(id: $address) {
      dpos
      travelCabins
    }
  }
`

export default userPortfolio
