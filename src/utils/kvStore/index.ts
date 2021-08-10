import { DynamoDB, AWSError } from 'aws-sdk'

export interface ReadUserResponse {
  Item?: {
    Project: {
      [index: string]: {
        Referrer: string | null
      }
    } | null
    User: string
  }
}

/** Typeguard for response */
function responseIsReadUser(response: ReadUserResponse | undefined): response is ReadUserResponse {
  if (!response || !response.Item) return false
  return Object.keys(response.Item).length > 0
}

/** Get the full item for a User */
export async function kvReadUser(client: DynamoDB.DocumentClient, address: string) {
  const params = {
    Key: {
      User: address,
    },
    TableName: 'User',
  }
  // If doesn't exist it will return any empty object
  return client
    .get(params)
    .promise()
    .then((result) => {
      if (result.$response.error) {
      } else {
        console.log('result', result)
        if (responseIsReadUser(result.Item)) {
          return result as ReadUserResponse
        }
      }
    })
}

/** Get the User's referrer from reading the user item */
export async function readUserReferrer(client: DynamoDB.DocumentClient, address: string, projectName: string) {
  const data = await kvReadUser(client, address)
  if (
    data &&
    data.Item &&
    data.Item.Project &&
    data.Item.Project[projectName] &&
    data.Item.Project[projectName].Referrer
  ) {
    return data.Item.Project[projectName].Referrer as string
  }
}

/**
 * Add referrer to user table.
 * @param client DynamoDB DocumentClient instance
 * @param address user address
 * @param projectName the token name
 * @param referrer referrer address
 */
export async function kvCreateUserReferrer(
  client: DynamoDB.DocumentClient,
  address: string,
  projectName: string,
  referrer: string
) {
  // Each user record has a project init with an empty map in kv store upon login
  const params = {
    TableName: 'User',
    Key: {
      User: address,
    },
    UpdateExpression: `set #p.${projectName} = :r`,
    ExpressionAttributeValues: {
      ':r': {
        Referrer: referrer,
      },
    },
    ProjectionExpression: ['#p'],
    ExpressionAttributeNames: { '#p': 'Project' },
    ReturnValues: 'UPDATED_NEW',
  }
  return client
    .update(params)
    .promise()
    .then(() => {
      console.info(`Added referrer for user for project: ${projectName}`)
      return true
    })
    .catch((e: AWSError) => console.log(e, e.stack))
}
