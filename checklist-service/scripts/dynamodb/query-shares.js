'use strict'

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT_URL
})

const tableName = 'checklists'

/*
testaccount1@example.com UserId: mock-auth-0d695c2089a71529bd14321f66ff709b
testaccount2@example.com mock-auth-f42fee8185ab2222cd625d7f5bc7f49f
*/
async function run() {
  console.log('Querying records')
  const userId = 'mock-auth-f42fee8185ab2222cd625d7f5bc7f49f' // testaccount2
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
            ProjectionExpression: '#nm',
            ExpressionAttributeNames: {
              '#nm': 'name'
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
    console.log('Finished querying records', sharedLists)
  }
}

run()
