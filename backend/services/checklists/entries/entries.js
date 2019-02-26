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

  return {
    entId,
    title,
    value
  }
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

async function listEntries({ listId, userId }) {
  return (await dynamoDocClient()
    .get({
      TableName: tableName,
      Key: { userId, listId },
      ProjectionExpression: 'entries'
    })
    .promise()).Item.entries
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
