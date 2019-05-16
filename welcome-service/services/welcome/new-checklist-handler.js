const AWS = require('aws-sdk')
const SQS = new AWS.SQS()
const log = require('../../lib/log')

const queueName = process.env.EMAIL_QUEUE_NAME
if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
} else {
  log.info({ queueName }, 'Using queue')
}

// Get the queue here using the queue name
const params = {
  QueueName: queueName
}

const queueUrlPromise = fetchQueueUrl()

async function fetchQueueUrl() {
  const queueUrl = (await SQS.getQueueUrl(params).promise()).QueueUrl
  log.info({ queueUrl }, 'Using queue URL')
  return queueUrl
}

async function handleNewChecklist(event) {
  log.info(event)

  var params = {
    MessageAttributes: {
      Name: {
        DataType: 'String',
        StringValue: event.detail.name
      },
      UserId: {
        DataType: 'String',
        StringValue: event.detail.userId
      }
    },

    MessageBody:
      "You created the list: '" + event.detail.name + "' on SLICLists.com!",
    QueueUrl: await queueUrlPromise
  }

  log.info({ params }, 'Sending SQS message')
  const result = await SQS.sendMessage(params).promise()

  log.info({ result }, 'Sent SQS message')
}

module.exports = {
  handleNewChecklist
}
