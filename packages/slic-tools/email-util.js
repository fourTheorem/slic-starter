const {
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
} = require('@aws-sdk/client-sqs');
const { captureAWSv3Client } = require('aws-xray-sdk-core');

const log = require('./log');

const sqsClient = captureAWSv3Client(
  new SQSClient({ endpoint: process.env.SQS_ENDPOINT_URL })
);

const { EMAIL_QUEUE_NAME: queueName } = process.env;

if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set');
} else {
  log.info({ queueName }, 'Using queue');
}
async function fetchQueueUrl() {
  const params = {
    QueueName: queueName,
  };

  try {
    const { QueueUrl } = await sqsClient.send(new GetQueueUrlCommand(params));
    log.info({ QueueUrl }, 'Using queue URL');

    return QueueUrl;
  } catch (err) {
    log.error({ err }, 'Failed to read queue URL');
    throw err;
  }
}

async function sendEmail(message) {
  const QueueUrl = await fetchQueueUrl();
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl,
  };

  const result = await sqsClient.send(new SendMessageCommand(params));
  log.debug({ result }, 'Sent SQS Message');
}

module.exports = {
  sendEmail,
};
