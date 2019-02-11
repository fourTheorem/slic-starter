'use strict'

const AWS = require('aws-sdk')

AWS.config.update({ region: process.env.AWS_REGION })

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const tableName = 'checklists'

const userId = 'TODO1'
const listId = 'TODO1'

async function test() {
  const updatedAt = Date.now()
  const entries = [1, 2, 3]

  console.log('Executing update')

  const result = await dynamoDb
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression: 'SET entries= :entries, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':entries': entries,
        ':updatedAt': updatedAt
      }
    })
    .promise()

  console.log('DONE', result)
}

test()
