'use strict'

const path = require('path')

const awsMock = require('aws-sdk-mock')
const { test } = require('tap')

const fromAddress = 'noreply@example.com'
process.env.EMAIL_FROM_ADDRESS = fromAddress

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const received = {
  SES: {}
}

awsMock.mock('SES', 'sendEmail', function(params, callback) {
  received.SES.sendEmail = params
  callback(null, { ...params })
})

test('email sends an email', async t => {
  process.env.EMAIL_FROM_ADDRESS = 'noreply@example.com'
  const emailHandler = require('../../../services/email/email-handler')

  const message = {
    Records: [
      {
        body:
          '{"to":"example@example.com" , "subject":"SLIC List", "body": "hello"}'
      }
    ]
  }

  await emailHandler.sendEmail(message, {}, () => {})

  const expected = {
    Destination: {
      ToAddresses: ['example@example.com']
    },
    Message: {
      Body: {
        Text: {
          Data: 'hello',
          Charset: 'UTF-8'
        }
      },
      Subject: {
        Data: 'SLIC List',
        Charset: 'UTF-8'
      }
    },
    Source: fromAddress
  }

  t.match(received.SES.sendEmail, expected)
  t.end()
})
