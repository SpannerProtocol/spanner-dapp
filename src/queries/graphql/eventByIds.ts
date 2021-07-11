import { gql } from '@apollo/client'

const eventsByIds = gql`
  query EventsByIds($eventIds: [String!], $first: Int!, $offset: Int!, $orderBy: [EventsOrderBy!]) {
    events(filter: { id: { in: $eventIds } }, first: $first, offset: $offset, orderBy: $orderBy) {
      totalCount
      nodes {
        id
        section
        method
        data
        extrinsic {
          timestamp
          method
          section
          args
          events {
            nodes {
              section
              method
              data
            }
          }
        }
      }
    }
  }
`

export default eventsByIds
