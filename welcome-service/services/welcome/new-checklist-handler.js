import { getUser } from 'slic-tools/user-tools/get'
const signedAxios = require('aws-signed-axios')
const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')

const log = require('slic-tools/log')

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

  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: await queueUrlPromise
  }

  const result = await SQS.sendMessage(params).promise()
  log.info({ result }, 'Sent SQS message')
}

module.exports = {
  handleNewChecklist
}
