'use strict'

const uuid = require('uuid')

const { dispatchEvent } = require('slic-tools/event-dispatcher')
const { dynamoDocClient } = require('slic-tools/aws')
const log = require('slic-tools/log')

const tableName = 'checklists'

module.exports = {
  create,
  update,
  remove,
  get,
  list,
  addCollaborator,
  listCollaborators
}

async function create({ userId, name, description }) {
  const item = {
    userId,
    name,
    description,
    entries: {},
    listId: uuid.v4(),
    createdAt: Date.now()
  }
  await dynamoDocClient()
    .put({
      TableName: tableName,
      Item: item
    })
    .promise()

  await dispatchEvent('LIST_CREATED_EVENT', item)

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
  console.log('USER ID', userId)
  // Find all lists accessible by the user, including
  // shared lists which have sharedListOwner set but no values
  // for name, description or createdAt
  const lists = (await dynamoDocClient()
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
    const sharedLists = (await dynamoDocClient()
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
  return lists
}

async function addCollaborator({ userId, listId, sharedListOwner }) {
  const item = {
    userId,
    sharedListOwner,
    listId
  }

  console.log({ item })

  await dynamoDocClient()
    .put({ TableName: tableName, Item: item })
    .promise()

  return item
}

async function listCollaborators({ listId, userId }) {
  const result = await dynamoDocClient()
    .query({
      TableName: tableName,
      ProjectionExpression: 'collaborators',
      KeyConditionExpression: 'listId = :listId AND userId = :userId',
      ExpressionAttributeValues: {
        ':listId': listId,
        ':userId': userId
      }
    })
    .promise()

  log.info({ result })
  return result.Items
}
