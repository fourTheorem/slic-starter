'use strict'

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT_URL
})

/*
testaccount1@example.com UserId: mock-auth-0d695c2089a71529bd14321f66ff709b

listId: ,"result":,"msg":"Result received","v":1}


testaccount2@example.com mock-auth-f42fee8185ab2222cd625d7f5bc7f49f

"result":,"msg":"Result received","v":1}
*/

const records = [
  {
    userId: 'mock-auth-0d695c2089a71529bd14321f66ff709b',
    name: 'List A owned by testaccount1@example.com',
    entries: {},
    listId: 'f0f3bcf9-61e7-47d8-99aa-8d9bdcc8b80f',
    createdAt: 1565082900907
  },
  {
    userId: 'mock-auth-f42fee8185ab2222cd625d7f5bc7f49f',
    name: 'List B owned by testaccount2@example.com',
    entries: {},
    listId: 'bfb92cb6-c6b5-4ef4-bc5f-c0178c0c0874',
    createdAt: 1565082960158
  },
  {
    userId: 'mock-auth-f42fee8185ab2222cd625d7f5bc7f49f',
    listId: 'f0f3bcf9-61e7-47d8-99aa-8d9bdcc8b80f',
    sharedListOwner: 'mock-auth-0d695c2089a71529bd14321f66ff709b'
  }
]

async function run() {
  console.log('Inserting records')
  await Promise.all(
    records.map(record =>
      docClient
        .put({
          TableName: 'checklists',
          Item: record
        })
        .promise()
    )
  )
  console.log('Finished inserting records')
}

run()
