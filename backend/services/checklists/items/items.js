'use strict'

const Uuid = require('uuid')
const { dynamoDocClient } = require('../../../lib/aws')

const tableName = 'checklists'

module.exports = {
  addItem,
  updateItem,
  listItems,
  deleteItem
}

async function addItem({ userId, listId, title, value }) {
  const entId = Uuid.v4()
  const params = {
    TableName: tableName,

    Key: {
      userId,
      listId
    },

    UpdateExpression: 'SET #ent.#entId = :entry',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId
    },

    ExpressionAttributeValues: {
      ':entry': {
        title,
        value
      }
    },

    ReturnValues: 'ALL_NEW'
  }

  await dynamoDocClient()
    .update(params)
    .promise()
}

async function updateItem({ entId, value }) {
  const params = {
    TableName: tableName,
    Key: { entId },
    UpdateExpression: 'SET value = :value',
    ExpressionAttributeValues: {
      value: value
    }
  }
  await dynamoDocClient()
    .update(params)
    .promise()
}

async function listItems({ listId }) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'listId = :listId',
    ExpressionAttributeValues: {
      ':listId': listId
    }
  }

  await dynamoDocClient()
    .query(params)
    .promise()
}

async function deleteItem({ userId, listId, entId }) {
  const params = {
    TableName: tableName,
    Key: {
      userId,
      listId
    },

    UpdateExpression: 'Remove #ent.#entId',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId
    },

    ReturnValues: 'ALL_NEW'
  }

  await dynamoDocClient()
    .update(params)
    .promise()
}
