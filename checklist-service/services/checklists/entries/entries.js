'use strict'

const Uuid = require('uuid')
const { dynamoDocClient } = require('slic-tools/aws')
const log = require('slic-tools/log')

const { createMetricsLogger, Unit } = require('aws-embedded-metrics')

const tableName = process.env.CHECKLIST_TABLE_NAME

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
  const {
    Attributes: { entries }
  } = await dynamoDocClient()
    .update(params)
    .promise()

  const metrics = createMetricsLogger()
  metrics.putMetric('NumEntries', Object.keys(entries).length, Unit.Count)
  metrics.putMetric('EntryWords', title.trim().split(/s/).length, Unit.Count)
  await metrics.flush()

  return {
    entId,
    title,
    value
  }
}

async function updateEntry({ userId, listId, entId, title, value }) {
  const params = {
    TableName: tableName,
    Key: {
      userId,
      listId
    },
    UpdateExpression:
      'SET #ent.#entId.#title = :title, #ent.#entId.#value = :value',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId,
      '#title': 'title',
      '#value': 'value'
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':value': value
    },
    ReturnValues: 'NONE'
  }

  await dynamoDocClient()
    .update(params)
    .promise()

  const metrics = createMetricsLogger()
  metrics.putMetric('EntryWords', title.trim().split(/s/).length, Unit.Count)
  await metrics.flush()

  return {
    entId,
    title,
    value
  }
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
