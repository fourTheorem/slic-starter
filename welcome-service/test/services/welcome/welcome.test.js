'use strict'

const path = require('path')
const proxyquire = require('proxyquire').noPreserveCache()

const awsMock = require('aws-sdk-mock')
const { test } = require('tap')

const userId = 'Test-User'

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))

const received = {
  SQS: {}
}

awsMock.mock('SQS', 'sendMessage', function(params, callback) {
  received.SQS.sendMessage = params
  callback(null, { ...params })
})

awsMock.mock('SQS', 'getQueueUrl', function(params, callback) {
  received.SQS.getQueueUrl = params
  callback(null, { QueueUrl: 'test-queue-url' })
})

awsMock.mock('SSM', 'getParameter', function(params, callback) {
  callback(null, {
    Parameter: {
      Value: 'url'
    }
  })
})

test('handleNewChecklist requires queue name to be set', t => {
  delete process.env.EMAIL_QUEUE_NAME
  t.throws(() => {
    require('../../../services/welcome/new-checklist-handler.js')
  })
  t.end()
})

test('handleNewChecklist sends a message to an SQS queue', async t => {
  const event = {
    detail: {
      userId,
      name: 'New Checklist'
    }
  }

  process.env.EMAIL_QUEUE_NAME = 'test-queue-name'
  const checklistHandler = proxyquire(
    '../../../services/welcome/new-checklist-handler.js',
    {
      axios: {
        get: url => {
          return Promise.resolve({ email: 'test@example.com' })
        }
      }
    }
  )

  const response = await checklistHandler.handleNewChecklist(event)

  const sqsParams = received.SQS.sendMessage
  const parsedBody = JSON.parse(sqsParams.MessageBody)

  t.equal(parsedBody.to, 'test@example.com')
  t.equal(parsedBody.subject, 'Your SLIC List')
  t.ok(parsedBody.body)
  t.ok(parsedBody.body.indexOf('New Checklist') > -1)

  t.end()
})
