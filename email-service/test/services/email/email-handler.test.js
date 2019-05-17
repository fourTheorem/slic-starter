'use strict'

const path = require('path')

const awsMock = require('aws-sdk-mock')
const { test } = require('tap')
const userId = 'Test-User'
awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const received = {
  SES: {}
}

awsMock.mock('SES', 'sendEmail', function(params, callback) {
  received.SES.sendEmail = params
  callback(null, { ...params })
})

test('handleNewChecklist sends a message to an SQS queue', async t => {
  const emailHandler = require('../../../services/email/email-handler')

  const message = {
    Records: [
      {
        body:
          '{"to":"example@example.com" , "subject":"Slic List", "body": "hello"}'
      }
    ]
  }

  const response = await emailHandler.sendEmail(message)

  t.end()
})
