const url = require('url')
const aws4 = require('aws4')
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
  const userUrl = `${await userServiceUrlPromise}${userId}`
  const { host, pathname } = new url.URL(userUrl)
  const request = {
    path: pathname,
    host,
    method: 'GET',
    url: userUrl
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    accessKeyId: AWS.config.credentials.accessKeyId,
    sessionToken: AWS.config.credentials.sessionToken
  })

  delete signedRequest.headers['Host']
  delete signedRequest.headers['Content-Length']
  log.info({ request, signedRequest }, 'SIGNED REQUEST')
  const { data: result } = await axios(signedRequest)
  log.info({ result }, 'RESULT')
  return result
}

module.exports = {
  handleNewChecklist
}
