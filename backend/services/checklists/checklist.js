'use strict'

const Uuid = require('uuid')
const { dynamoDocClient } = require('../../lib/aws')

const tableName = 'checklists'

module.exports = {
  create,
  update,
  remove,
  get,
  list
}

async function create({ userId, name, description }) {
  const item = {
    userId,
    name,
    description,
    entries: {},
    listId: Uuid.v4(),
    createdAt: Date.now()
  }
  await dynamoDocClient()
    .put({
      TableName: tableName,
      Item: item
    })
    .promise()
  return item
}

async function update({ listId, userId, name = null, description = null }) {
  const updatedAt = Date.now()
  await dynamoDocClient()
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression:
        'SET #nm = :name, updatedAt = :updatedAt, #description = :description',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#description': 'description'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':updatedAt': updatedAt,
        ':description': description
      }
    })
    .promise()
}

async function remove({ listId, userId }) {
  await dynamoDocClient()
    .delete({
      TableName: tableName,
      Key: { userId, listId }
    })
    .promise()
}

async function get({ listId, userId }) {
  return (await dynamoDocClient()
    .get({
      TableName: tableName,
      Key: { userId, listId },
      ProjectionExpression: 'listId, #nm, createdAt',
      ExpressionAttributeNames: {
        '#nm': 'name'
      }
    })
    .promise()).Item
}

async function list({ userId }) {
  return (await dynamoDocClient()
    .query({
      TableName: tableName,
      ProjectionExpression: 'listId, #nm, #description, createdAt',
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
}
