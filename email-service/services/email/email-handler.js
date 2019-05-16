const AWS = require('aws-sdk')

const log = require('../../lib/log')

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
    // TODO - Change the 'from' email address
    Source: 'paul.kevany+slicsqs@fourtheorem.com'
  }

  const result = await new AWS.SES().sendEmail(params).promise()

  log.info({ result }, 'Sent email')
}

module.exports = {
  sendEmail
}
