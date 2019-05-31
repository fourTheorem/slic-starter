'use strict'

const path = require('path')

const awsMock = require('aws-sdk-mock')
const { test } = require('tap')

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
const received = {
  SES: {}
}

awsMock.mock('SES', 'sendEmail', function(params, callback) {
  received.SES.sendEmail = params
  callback(null, { ...params })
})

test('email service requires from email address to be set', t => {
  t.throws(() => require('../../../services/email/email-handler'))
  t.end()
})

test('email sends an email', async t => {
  process.env.EMAIL_FROM_ADDRESS = 'no-reply@example.com'
  const emailHandler = require('../../../services/email/email-handler')

  const message = {
    Records: [
      {
        body:
          '{"to":"example@example.com" , "subject":"SLIC List", "body": "hello"}'
      }
    ]
  }

  await emailHandler.sendEmail(message)

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
    Source: 'no-reply@example.com'
  }
  t.match(received.SES.sendEmail, expected)
  t.end()
})
