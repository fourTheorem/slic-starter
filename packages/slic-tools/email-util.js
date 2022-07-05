import {
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import AWSXRay from 'aws-xray-sdk-core';

import { log } from './log.js';

const sqsClient = AWSXRay.captureAWSv3Client(
  new SQSClient({ endpoint: process.env.SQS_ENDPOINT_URL })
);

const { EMAIL_QUEUE_NAME: queueName = 'email-queue' } = process.env;

log.info({ queueName }, 'Using queue');

async function fetchQueueUrl() {
  const params = {
    QueueName: queueName,
  };

  try {
    const { QueueUrl } = await sqsClient.send(new GetQueueUrlCommand(params));
    log.info({ QueueUrl }, 'Using queue URL');

    return QueueUrl;
  } catch (error) {
    log.error({ error }, 'Failed to read queue URL');
    throw error;
  }
}

export async function sendEmail(message) {
  const QueueUrl = await fetchQueueUrl();
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl,
  };

  const result = await sqsClient.send(new SendMessageCommand(params));
  log.debug({ result }, 'Sent SQS Message');
}
