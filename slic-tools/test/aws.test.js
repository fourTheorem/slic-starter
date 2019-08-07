'use strict'

const proxyquire = require('proxyquire').noPreserveCache()

const { test } = require('tap')

const message = 'Dummy Dynamo'
const received = {}
const aws = () =>
  proxyquire('../aws', {
    'aws-sdk': {
      DynamoDB: {
        DocumentClient: function DocumentClient(options) {
          received.options = options
          this.message = message
        }
      }
    }
  })

test('A DynamoDB client is provided', t => {
  const result = aws().dynamoDocClient()

  t.equal(result.message, 'Dummy Dynamo')

  t.end()
})

test('A DynamoDB client is provided when the port is specified', t => {
  process.env.DYNAMODB_LOCAL_PORT = 9000
  const result = aws().dynamoDocClient()

  t.equal(result.message, 'Dummy Dynamo')

  t.end()
})

test('A local DynamoDB client is provided when offline', t => {
  process.env.IS_OFFLINE = true
  const result = aws().dynamoDocClient()
  t.equal(result.message, 'Dummy Dynamo')
  t.equal(received.options.region, 'localhost')

  t.end()
})
