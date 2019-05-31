'use strict'

const AWS = require('aws-sdk')

const log = require('../../lib/log')

const fromAddress = process.env.EMAIL_FROM_ADDRESS
if (!fromAddress) {
  throw new Error('EMAIL_FROM_ADDRESS must be specified')
}

const ses = new AWS.SES({ endpoint: process.env.SES_ENDPOINT_URL })

async function sendEmail(message) {
  log.info({ message }, 'sendEmail')

  const { to, subject, body } = JSON.parse(message.Records[0].body)

  const params = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress
  }

  const result = await ses.sendEmail(params).promise()

  log.info({ result }, 'Sent email')
}

module.exports = {
  sendEmail
}
