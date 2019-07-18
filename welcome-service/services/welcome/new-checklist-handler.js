const signedAxios = require('aws-signed-axios')
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')

const log = require('slic-tools/log')
import { getUser } from 'slic-tools/user-util'
const { sendEmail } = require('slic-tools/email-util')

const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

const userServiceUrlPromise = getUserServiceUrl()

async function getUserServiceUrl() {
  const result = await SSM.getParameter({ Name: 'UserServiceUrl' }).promise()
  const {
    Parameter: { Value: userServiceUrl }
  } = result
  return userServiceUrl
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

module.exports = {
  handleNewChecklist
}
