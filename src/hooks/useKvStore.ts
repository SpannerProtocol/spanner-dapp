import { useEffect, useState } from 'react'
import { kvReadUser } from 'utils/kvStore'
import { kvClient, kvDocClient } from '../connectors'
import useWallet from './useWallet'

export function useKvClient() {
  return kvClient
}

export function useKvDocClient() {
  return kvDocClient
}

/**
 * Create the User table if it does not exist. This only needs to run once in every new environment.
 * @param tableName table of the user
 */
export function useCreateTableUser() {
  const client = useKvClient()
  const [tableExists, setTableExists] = useState<boolean>(false)
  // Everytime this hook is used the first time, do a check to make sure the table exists
  useEffect(() => {
    if (!tableExists) {
      client.describeTable({ TableName: 'User' }, (err, data) => {
        if (err && err.code === 'ResourceNotFoundException') {
          const params = {
            AttributeDefinitions: [
              {
                AttributeName: 'User',
                AttributeType: 'S',
              },
            ],
            KeySchema: [
              {
                AttributeName: 'User',
                KeyType: 'HASH',
              },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
            TableName: 'User',
          }
          client.createTable(params, (err) => {
            if (err) console.log(err, err.stack)
            else {
              console.log('INIT: Did not find User table. Will create.')
              setTableExists(true)
            }
          })
        } else {
          if (data.Table && data.Table.TableName === 'User' && data.Table.TableStatus === 'ACTIVE') {
            console.log('INIT: DynamoDB connected, User table found.')
            setTableExists(true)
          }
        }
      })
    }
  }, [client, tableExists])
  return tableExists
}

export function useUserKvHasProject() {
  const wallet = useWallet()
  const client = useKvDocClient()
  const [hasProject, setHasProject] = useState<boolean>(false)

  useEffect(() => {
    if (!wallet || !wallet.address) return
    const params = {
      TableName: 'User',
      Item: {
        UserId: wallet.address,
        Project: {},
      },
      Key: {
        UserId: wallet.address,
      },
    }
    kvReadUser(client, wallet.address).then((result) => {
      if (result) {
        if (Object.keys(result.Item).includes('Project')) {
          console.info(`INIT: already has project.`)
          setHasProject(true)
          return
        }
        // User has record but no project
        client
          .put(params)
          .promise()
          .then(() => {
            console.info(`INIT: Added project to user info.`)
            setHasProject(true)
          })
      } else {
        // No record of user
        client
          .put(params)
          .promise()
          .then(() => {
            console.info(`INIT: Added project to user info.`)
            setHasProject(true)
          })
      }
    })
  }, [wallet, wallet?.address, client])

  return hasProject
}
