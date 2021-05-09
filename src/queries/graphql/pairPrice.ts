import { gql } from '@apollo/client'

const pairPrice = gql`
  query PairPrice($first: Int!, $offset: Int!, $pairId: String!) {
    pair(id: $pairId) {
      pairHourData(first: $first, offset: $offset, orderBy: HOUR_START_TIME_DESC) {
        totalCount
        nodes {
          pairId
          price
          hourStartTime
          hourlyVolumeToken1
          hourlyVolumeToken2
          hourlyTxns
          poolAmount1
          poolAmount2
          hourStartTime
        }
      }
    }
  }
`

export default pairPrice
