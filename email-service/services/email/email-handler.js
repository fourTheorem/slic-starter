'use strict'

const { middify } = require('slic-tools/middy-util')

const { AWS } = require('slic-tools/aws')
const awsXray = require('aws-xray-sdk-core')

const log = require('slic-tools/log')

const ses = awsXray.captureAWSClient(
  new AWS.SES({
    endpoint: process.env.SES_ENDPOINT_URL,
    region: process.env.SES_REGION
  })
)

async function sendEmail (message, context) {
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
    Source: context.emailFromAddress
  }

  const result = await ses.sendEmail(params).promise()
  log.info({ result }, 'Sent email')
}

module.exports = middify(
  { sendEmail },
  {
    ssmParameters: {
      emailFromAddress: `/${process.env.SLIC_STAGE}/email-service/from-address`
    }
  }
)
