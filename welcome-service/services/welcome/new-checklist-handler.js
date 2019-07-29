'use strict'
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')

const log = require('slic-tools/log')
const { getUser } = require('slic-tools/user-util')
const { sendEmail } = require('slic-tools/email-util')

async function handleNewChecklist(event) {
  log.info({ event })

  const checklist = event.detail
  const { userId, name } = checklist

  const { email } = await getUser(userId)
  const message = {
    to: email,
    subject: 'Your SLIC List',
    body: `Congratulations! You created the list ${name}`
  }

  await sendEmail(message)
}

module.exports = {
  handleNewChecklist
}
