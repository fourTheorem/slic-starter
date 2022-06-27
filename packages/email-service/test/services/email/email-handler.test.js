const { mockClient } = require('aws-sdk-client-mock')
const {
  SESv2Client,
  SendEmailCommand
} = require('@aws-sdk/client-sesv2')
const t = require('tap')

const emailHandler = require('../../../services/email/email-handler')

const sesMock = mockClient(SESv2Client)

t.beforeEach(async function () {
  await sesMock.reset()
  sesMock.on(SendEmailCommand).resolves({})
})

t.test('email sends an email', async t => {
  const emailFromAddress = 'noreply@example.com'
  const event = {
    Records: [
      {
        body:
          '{"to":"example@example.com" , "subject":"SLIC List", "body": "hello"}'
      }
    ]
  }

  await emailHandler.sendEmail(event, { emailFromAddress })

  const expectedArgs = {
    Destination: {
      ToAddresses: ['example@example.com']
    },
    Content: {
      Simple: {
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
      }
    },
    FromEmailAddress: emailFromAddress
  }

  t.equal(sesMock.send.callCount, 1)
  t.same(sesMock.send.firstCall.args[0].input, expectedArgs)
})
