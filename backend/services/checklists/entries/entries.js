'use strict'

const Uuid = require('uuid')
const { dynamoDocClient } = require('../../../lib/aws')

const tableName = 'checklists'

module.exports = {
  addEntry,
  updateEntry,
  listEntries,
  deleteEntry
}

async function addEntry({ userId, listId, title, value }) {
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

async function updateEntry({ entId, value }) {
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

async function listEntries({ listId }) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'listId = :listId',
    ExpressionAttributeValues: {
      ':listId': listId
    }
  }

  return (await dynamoDocClient()
    .query(params)
    .promise()).Items
}

async function deleteEntry({ userId, listId, entId }) {
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
