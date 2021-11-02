'use strict'

const awsXray = require('aws-xray-sdk')
const coreAws = require('aws-sdk')
const AWS = process.env.IS_OFFLINE ? coreAws : awsXray.captureAWS(coreAws) // TODO - Revisit this to enable XRay always

const log = require('./log')

const SQS = awsXray.captureAWSClient(
  new AWS.SQS({ endpoint: process.env.SQS_ENDPOINT_URL })
)

const queueName = process.env.EMAIL_QUEUE_NAME

if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
} else {
  log.info({ queueName }, 'Using queue')
}

async function sendEmail (message) {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: await fetchQueueUrl()
  }

  const result = await SQS.sendMessage(params).promise()
  log.debug({ result }, 'Sent SQS Message')
}

let queueUrlPromise

function fetchQueueUrl () {
  if (queueUrlPromise) {
    return queueUrlPromise
  }

  queueUrlPromise = SQS.getQueueUrl({
    QueueName: queueName
  })
    .promise()
    .then(result => {
      const queueUrl = result.QueueUrl
      log.info({ queueUrl }, 'Using queue URL')
      return queueUrl
    })
    .catch(err => {
      log.error({ err }, 'Failed to read queue URL')
      queueUrlPromise = null
      throw err
    })
  return queueUrlPromise
}

module.exports = {
  sendEmail
}
