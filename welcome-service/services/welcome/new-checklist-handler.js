const signedAxios = require('aws-signed-axios')
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')
const {middify} = require('slic-tools/middy-util')
const log = require('slic-tools/log')
import { getUser } from 'slic-tools/user-util'
const { sendEmail } = require('slic-tools/email-util')

async function getUserServiceUrl() {
  return UserServiceUrl
}

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

module.exports = middify(
  {handleNewChecklist},
    {
      ssmParameters: {
        UserServiceUrl: 'UserServiceUrl'
      }}
)
