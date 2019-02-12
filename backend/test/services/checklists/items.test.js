'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const { test } = require('tap')
const items = require('../../../services/checklists/items/items')
const userId = 'my-test-user'

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

test('add new list item', async t => {
  const record = {
    userId,
    listId: '1234',
    title: 'new item',
    value: 'not done'
  }

  const response = await items.addItem(record)

  //
})

test('add new list item', async t => {
  const record = {
    entId: '1',
    value: 'Done'
  }

  const response = await items.updateItem(record)
})
