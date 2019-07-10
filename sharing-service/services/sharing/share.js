'use strict'
const { createSignedLink } = require('./lib/signcode.js')
const { getUser } = require('../../../slic-tools/user-tools/get')

const signedAxios = require('aws-signed-axios')
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')

const log = require('../../../slic-tools/log')

const SQS = awsXray.captureAWSClient(
  new AWS.SQS({ endpoint: process.env.SQS_ENDPOINT_URL })
)
const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

const queueName = process.env.EMAIL_QUEUE_NAME
if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
} else {
  log.info({ queueName }, 'Using queue')
}

const queueUrlPromise = fetchQueueUrl()

async function fetchQueueUrl() {
  const queueUrl = (await SQS.getQueueUrl({ QueueName: queueName }).promise())
    .QueueUrl
  log.info({ queueUrl }, 'Using queue URL')
  return queueUrl
}

const userServiceUrlPromise = getUserServiceUrl()

async function create({ email, userId, listId }) {
  const senderEmail = await getUser(userId)

  //Sign the code for the invite link

  const link = await createSignedLink(listId, userId, email)

  const message = {
    to: email,
    subject: 'You were added as a SLICLists Collaborator',
    body: `${email} added you to their list. Click ${link} to accept`
  }

  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: await queueUrlPromise
  }

  const result = await SQS.sendMessage(params).promise()
  log.info({ result }, 'Send SQS Message')
}

const userServiceUrlPromise = getUserServiceUrl()

module.exports = {
  create
}
