'use strict'

const path = require('path')
const { test } = require('tap')
const awsMock = require('aws-sdk-mock')
awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))

const entries = require('../../../../services/checklists/entries/entries')

const userId = 'my-test-user'
const entId = '4'
const listId = 'a432'
const testEntries = [
  { entId: 'ent1', title: 'Entry One' },
  { entId: 'ent2', title: 'Entry Two' }
]

const received = {
  dynamoDb: {}
}

awsMock.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
  received.dynamoDb.put = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'update', function(params, callback) {
  received.dynamoDb.update = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'query', function(params, callback) {
  received.dynamoDb.query = params
  callback(null, { Items: testEntries })
})

test('add new list entry', async t => {
  const record = {
    userId,
    listId,
    title: 'new entry',
    value: 'not done'
  }

  await entries.addEntry(record)

  t.ok(received.dynamoDb.update.Key.userId)
  t.ok(received.dynamoDb.update.Key.listId)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues[':entry'].title,
    record.title
  )

  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues[':entry'].value,
    record.value
  )

  t.end()
})

test('list all entries', async t => {
  const record = {
    listId
  }
  const response = await entries.listEntries(record)
  t.equal(
    received.dynamoDb.query.ExpressionAttributeValues[':listId'],
    record.listId
  )
  t.same(response, testEntries)
  t.end()
})

test('Update entry', async t => {
  const record = {
    entId,
    value: 'Complete'
  }
  await entries.updateEntry(record)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues.value,
    record.value
  )

  t.equal(received.dynamoDb.update.Key.entId, record.entId)
  t.end()
})

test('Delete Entry', async t => {
  const record = {
    userId,
    entId,
    listId
  }
  await entries.deleteEntry(record)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeNames['#entId'],
    record.entId
  )
  t.equal(received.dynamoDb.update.Key.userId, record.userId)
  t.equal(received.dynamoDb.update.Key.listId, record.listId)

  t.end()
})
