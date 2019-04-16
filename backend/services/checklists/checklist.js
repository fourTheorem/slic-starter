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

async function create({ userId, name, description, category }) {
  const item = {
    userId,
    name,
    description,
    category,
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

async function update({
  listId,
  userId,
  name = null,
  description = null,
  category = null
}) {
  const updatedAt = Date.now()
  const result = await dynamoDocClient()
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression:
        'SET #name = :name, updatedAt = :updatedAt, #description = :description, #category = :category',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#description': 'description',
        '#category': 'category'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':updatedAt': updatedAt,
        ':description': description,
        ':category': category
      },

      ReturnValues: 'ALL_NEW'
    })
    .promise()

  return result.Attributes
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
      ProjectionExpression: 'listId, #nm, #description, #category, createdAt',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#description': 'description',
        '#category': 'category'
      }
    })
    .promise()).Item
}

async function list({ userId }) {
  return (await dynamoDocClient()
    .query({
      TableName: tableName,
      ProjectionExpression: 'listId, #nm, #description, #category, createdAt',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#description': 'description',
        '#category': 'category'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()).Items
}
