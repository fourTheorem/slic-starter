//Retrieve Confirmation code from email using Mailosaur

require('dotenv').config()

const Mailosaur = require('mailosaur')

const client = new Mailosaur(process.env.MAILOSAUR_API_KEY)

export function generateEmailAddress() {
  return client.servers.generateEmailAddress(process.env.MAILOSAUR_SERVER_ID)
}

export function retrieveCode(emailAddress) {
  return client.messages
    .waitFor(process.env.MAILOSAUR_SERVER_ID, {
      sentTo: emailAddress
    })
    .then(email => {
      const emailBody = email.html.body
      const splitBody = emailBody.split(' ')
      const confirmationCode = splitBody[splitBody.length - 1]
      return confirmationCode
    })
}
