'use strict'

const Mailosaur = require('mailosaur')
const RandomWords = require('random-words')

const { MAILOSAUR_SERVER_ID: serverId } = process.env

const client = new Mailosaur(process.env.MAILOSAUR_API_KEY)

module.exports = {
  generateEmailAddress,
  retrieveCode,
  retrieveEmail
}

function generateEmailAddress() {
  return `${RandomWords(3).join('-')}.${serverId}@mailosaur.io`
}

async function retrieveCode(emailAddress) {
  const email = await retrieveEmail(emailAddress)
  const emailBody = email.html.body
  const splitBody = emailBody.split(' ')
  const confirmationCode = splitBody[splitBody.length - 1]
  return confirmationCode
}

async function retrieveEmail(emailAddress, subject) {
  const message = await client.messages.get(
    process.env.MAILOSAUR_SERVER_ID,
    {
      sentTo: emailAddress,
      subject
    },
    {
      timeout: 30000
    }
  )
  await client.messages.del(message.id)
  return message
}
