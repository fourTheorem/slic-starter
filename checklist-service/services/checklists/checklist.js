const { createNewListEvent } = require('slic-tools/event-dispatcher')

const Uuid = require('uuid')
const { dynamoDocClient } = require('slic-tools/aws')

const tableName = 'checklists'

module.exports = {
  create,
  update,
  remove,
  get,
  list,
  addCollaborator
}

async function create({ userId, name, description }) {
  const item = {
    userId,
    name,
    description,
    entries: {},
    collaborators: {},
    listId: Uuid.v4(),
    createdAt: Date.now()
  }
  await dynamoDocClient()
    .put({
      TableName: tableName,
      Item: item
    })
    .promise()
  await createNewListEvent(item)

  return item
}

async function update({ listId, userId, name = null, description = null }) {
  const updatedAt = Date.now()
  const result = await dynamoDocClient()
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression:
        'SET #name = :name, updatedAt = :updatedAt, #description = :description',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#description': 'description'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':updatedAt': updatedAt,
        ':description': description
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
      ProjectionExpression: 'listId, #nm, #description, createdAt',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#description': 'description'
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

async function addCollaborator({ userId, listId, collaboratorUserId }) {
  const docClient = await dynamoDocClient()
  const result = await docClient
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression: 'ADD collaborators :collaborators',
      ExpressionAttributeValues: {
        ':collaborators': docClient.createSet([collaboratorUserId])
      },
      ReturnValues: 'UPDATED_NEW'
    })
    .promise()

  return result.Attributes
}
