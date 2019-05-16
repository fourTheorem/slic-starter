//Retrieve Confirmation code from email using Mailosaur

require('dotenv').config()

const Mailosaur = require('mailosaur')
const RandomWords = require('random-words')

const {
  MAILOSAUR_API_KEY: apiKey,
  MAILOSAUR_SERVER_ID: serverId
} = process.env

console.log('Using mailosaur config', { apiKey, serverId })
const client = new Mailosaur(apiKey)

export function generateEmailAddress() {
  return `${RandomWords(3).join('-')}.${serverId}@mailosaur.io`
}

export async function retrieveCode(emailAddress) {
  console.log('Retrieving code for', emailAddress)
  const code = await client.messages
    .waitFor(serverId, {
      sentTo: emailAddress
    })
    .then(email => {
      const emailBody = email.html.body
      const splitBody = emailBody.split(' ')
      const confirmationCode = splitBody[splitBody.length - 1]
      return confirmationCode
    })
  console.log('Retrieved code', code, 'for', emailAddress)
  return code
}
