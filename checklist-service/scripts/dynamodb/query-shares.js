'use strict'

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT_URL
})

const tableName = 'checklists'

/*
testaccount1@example.com UserId: mock-auth-dGVzdGFjY291bnQxQGV4YW1wbGUuY29t
testaccount2@example.com mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t
*/
async function run() {
  console.log('Querying records')
  const userId = 'mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t' // testaccount2
  const lists = (await docClient
    .query({
      TableName: tableName,
      ProjectionExpression:
        'listId, #nm, #description, createdAt, sharedListOwner, userId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#description': 'description'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()).Items

  console.log({ lists })
  const sharedListKeys = lists
    .filter(list => list.sharedListOwner)
    .map(list => ({ userId: list.sharedListOwner, listId: list.listId }))

  // Next, find the actual records for shared lists with name, description and createdAt values
  if (sharedListKeys.length) {
    const sharedLists = (await docClient
      .batchGet({
        RequestItems: {
          [tableName]: {
            Keys: sharedListKeys,
            ProjectionExpression:
              'listId, #nm, #description, createdAt, userId',
            ExpressionAttributeNames: {
              '#nm': 'name',
              '#description': 'description'
            }
          }
        }
      })
      .promise()).Responses[tableName]
    // Merge values from actual records into shared list records
    console.log('sharedlists***', { sharedLists })
    sharedLists.forEach(sharedList => {
      console.log('INDIVIDUAL_SHARED_LIST', sharedList)
      const record = lists.find(list => list.listId === sharedList.listId)
      console.log('record', record)
      Object.assign(record, {
        name: sharedList.name,
        description: sharedList.description,
        createdAt: sharedList.createdAt
      })
    })
  }
  console.log('Finished querying records', lists)
}

run()
