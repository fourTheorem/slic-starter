const AWS = require('aws-sdk')

const log = require('../../lib/log')

async function sendEmail(message) {
  const params = {
    Destination: {
      ToAddresses: ['paul.kevany@fourtheorem.com']
    },

    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: 'Welcome to SLIC Starter'
        }
      },

      Subject: {
        Charset: 'UTF-8',
        Data: 'SLIC Updates'
      }
    },

    Source: 'paul.kevany+slicsqs@fourtheorem.com'
  }

  const result = await new AWS.SES().sendEmail(params).promise()

  log.info({ result }, 'Sent email')
}

module.exports = {
  sendEmail
}
