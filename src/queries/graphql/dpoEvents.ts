import { gql } from '@apollo/client'

const dpoEvents = gql`
  query DpoEvents($id: String!) {
    dpo(id: $id) {
      id
      events
    }
  }
`

export default dpoEvents
