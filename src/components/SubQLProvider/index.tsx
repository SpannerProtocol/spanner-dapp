import { HAMMER_SUBQL } from '../../constants'
import { SPANNER_SUBQL } from '../../constants'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { useChainState } from 'state/connections/hooks'

interface SubQLProviderProps {
  children: React.ReactNode
}

const initClient = new ApolloClient(
  new ApolloClient({
    uri: SPANNER_SUBQL,
    cache: new InMemoryCache(),
  })
)

export default function SubQLProvider({ children }: SubQLProviderProps) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>(initClient)
  const { chain } = useChainState()

  useEffect(() => {
    if (!chain) return
    let connection
    if (chain.chain === 'Spanner') {
      connection = new ApolloClient({
        uri: SPANNER_SUBQL,
        cache: new InMemoryCache(),
      })
    } else {
      connection = new ApolloClient({
        uri: HAMMER_SUBQL,
        cache: new InMemoryCache(),
      })
    }
    setClient(connection)
  }, [chain])
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
