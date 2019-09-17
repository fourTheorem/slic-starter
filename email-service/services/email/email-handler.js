'use strict'

const { middify } = require('slic-tools/middy-util')

const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')

const log = require('slic-tools/log')

const ses = awsXray.captureAWSClient(
  new AWS.SES({
    endpoint: process.env.SES_ENDPOINT_URL,
    region: process.env.SES_REGION
  })
)

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
    Source: process.env.EMAIL_FROM_ADDRESS
  }

  const result = await ses.sendEmail(params).promise()
  log.info({ result }, 'Sent email')
}

module.exports = middify(
  { sendEmail },
  {
    ssmParameters: {
      EMAIL_FROM_ADDRESS: `/${process.env.SLIC_STAGE}/email-service/from-address`
    }
  }
)
