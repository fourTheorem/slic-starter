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

  t.match(response, record)

  t.end()
})
