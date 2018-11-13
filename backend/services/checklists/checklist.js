'use strict'

const AWS = require('aws-sdk')
const Uuid = require('uuid')

AWS.config.update({ region: process.env.AWS_REGION })

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const tableName = 'checklists'

module.exports = {
  create,
  update,
  remove,
  get,
  list
}

async function create({ userId, name, tasks }) {
  const item = {
    userId,
    name,
    tasks,
    listId: Uuid.v4(),
    createdAt: Date.now()
  }
  await dynamoDb
    .put({
      TableName: tableName,
      Item: item
    })
    .promise()
  return item
}

async function update({ listId, userId, name = null, tasks = null }) {
  const updatedAt = Date.now()
  await dynamoDb
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression:
        'SET name = :name, tasks = :tasks, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':name': name,
        ':tasks': tasks,
        ':updatedAt': updatedAt
      }
    })
    .promise()
}

async function remove({ listId, userId }) {
  await dynamoDb
    .delete({
      TableName: tableName,
      Key: { userId, listId }
    })
    .promise()
}

async function get({ listId, userId }) {
  return (await dynamoDb.get(
    {
      TableName: tableName,
      Key: { userId, listId }
    }.promise
  )).Item
}

async function list({ userId }) {
  return (await dynamoDb.query({
    TableName: tableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  })).Items
}
