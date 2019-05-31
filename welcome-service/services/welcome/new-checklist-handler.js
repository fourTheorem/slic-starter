const axios = require('axios')
const AWS = require('aws-sdk')
const log = require('../../lib/log')

const SQS = new AWS.SQS({ endpoint: process.env.SQS_ENDPOINT_URL })
const SSM = new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })

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

const userServiceApiKeyPromise = getUserServiceApiKey()

async function getUserServiceApiKey() {
  const result = await SSM.getParameter({ Name: 'UserServiceApiKey' }).promise()
  const {
    Parameter: { Value: userServiceApiKey }
  } = result

  return userServiceApiKey
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

async function getUser(userId) {
  const userUrl = `${await userServiceUrlPromise}${userId}`
  const apiKey = await userServiceApiKeyPromise

  const { data: result } = await axios.get(userUrl, {
    headers: {
      'X-Api-Key': apiKey
    }
  })

  return result
}

module.exports = {
  handleNewChecklist
}
