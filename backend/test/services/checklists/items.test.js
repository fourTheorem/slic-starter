'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const { test } = require('tap')
const items = require('../../../services/checklists/items/items')
const userId = 'my-test-user'
const entId = '4'
const listId = 'a432'
const received = {
  dynamoDb: {}
}

awsMock.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
  received.dynamoDb.put = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
  received.dynamoDb.get = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'update', function(params, callback) {
  received.dynamoDb.update = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'query', function(params, callback) {
  received.dynamoDb.query = params
  callback(null, { ...params })
})

test('add new list item', async t => {
  const record = {
    userId,
    listId,
    title: 'new item',
    value: 'not done'
  }

  const response = await items.addItem(record)

  t.ok(received.dynamoDb.update.Key.userId)
  t.ok(received.dynamoDb.update.Key.listId)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues[':entry'].title,
    record.title
  )
  t.end()
  //
})

test('list all items', async t => {
  const record = {
    listId
  }
  const response = await items.listItems(record)
  t.equal(
    received.dynamoDb.query.ExpressionAttributeValues[':listId'],
    record.listId
  )
  t.end()
})

test('Update item', async t => {
  const record = {
    entId,
    value: 'Complete'
  }
  const response = await items.updateItem(record)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues.value,
    record.value
  )
  t.equal(received.dynamoDb.update.Key.entId, record.entId)
  t.end()
})

test('Delete Item', async t => {
  const record = {
    userId,
    entId,
    listId
  }
  const response = await items.deleteItem(record)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeNames['#entId'],
    record.entId
  )
  t.end()
})
