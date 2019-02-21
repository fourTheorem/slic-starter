'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const { test } = require('tap')

const userId = 'my-test-user'

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

awsMock.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
  received.dynamoDb.get = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'delete', function(params, callback) {
  received.dynamoDb.delete = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'query', function(params, callback) {
  received.dynamoDb.query = params
  callback(null, { ...params })
})

test('create puts a dynamodb item', async t => {
  const record = {
    userId,
    name: 'Test List'
  }

  const checklist = require('../../../services/checklists/checklist')

  const response = await checklist.create(record)
  t.equal(received.dynamoDb.put.Item.userId, userId)
  t.equal(received.dynamoDb.put.Item.name, record.name)
  t.ok(received.dynamoDb.put.Item.createdAt)
  t.ok(received.dynamoDb.put.Item.listId)
  t.same(received.dynamoDb.put.Item.entries, {})

  t.match(response, record)

  t.end()
})

test('update function updates current checklists', async t => {
  const record = {
    listId: '1234',
    userId,
    name: 'New title'
  }

  const checklist = require('../../../services/checklists/checklist')

  const updateResponse = await checklist.update(record)

  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':name'])
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':updatedAt'])
  t.equal(received.dynamoDb.update.Key.userId, record.userId)
  t.equal(received.dynamoDb.update.Key.listId, record.listId)
  t.end()
})

test('update function updates current checklists when name not specified', async t => {
  const record = {
    listId: '1234',
    userId
  }

  const checklist = require('../../../services/checklists/checklist')

  const updateResponse = await checklist.update(record)

  t.equal(received.dynamoDb.update.ExpressionAttributeValues[':name'], null)
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':updatedAt'])
  t.equal(received.dynamoDb.update.Key.userId, record.userId)
  t.equal(received.dynamoDb.update.Key.listId, record.listId)
  t.end()
})

test('Get a checklist based on a listId and userId', async t => {
  const record = {
    listId: '1234',
    userId
  }

  const checklist = require('../../../services/checklists/checklist')

  const response = await checklist.get(record)

  t.equal(received.dynamoDb.get.Key.listId, record.listId)
  t.equal(received.dynamoDb.get.Key.userId, record.userId)

  t.end()
})

test('remove a checklist', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    listId: '1234',
    userId
  }

  const response = await checklist.remove(record)

  t.equal(received.dynamoDb.delete.Key.userId, record.userId)
  t.equal(received.dynamoDb.delete.Key.listId, record.listId)

  t.end()
})

test('list all checklists', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    userId
  }

  const response = await checklist.list(record)

  t.equal(
    received.dynamoDb.query.ExpressionAttributeValues[':userId'],
    record.userId
  )

  t.end()
})
