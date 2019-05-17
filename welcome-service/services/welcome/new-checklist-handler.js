const AWS = require('aws-sdk')
const SQS = new AWS.SQS()
const SSM = new AWS.SSM()
const log = require('../../lib/log')

const axios = require('axios')

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
  log.info({ result }, 'Got parameter')
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

  log.info({ params }, 'Sending SQS message')
  const result = await SQS.sendMessage(params).promise()
  log.info({ result }, 'Sent SQS message')
}

async function getUser(userId) {
  return axios.get(`${await userServiceUrlPromise}/${userId}`)
}

module.exports = {
  handleNewChecklist
}
